// Copyright 2015-2020, University of Colorado Boulder

/**
 * An asynchronous (async.queue) queue with a concurrency of one (meaning that only one task is executed at a time)
 * that is used to serialize submissions of strings for a translation.
 *
 * @author Aaron Davis
 * @author John Blanco
 */

'use strict';

// modules
const _ = require( 'lodash' ); // eslint-disable-line
const longTermStringStorage = require( './longTermStringStorage' );
const { Pool } = require( 'pg' ); // eslint-disable-line
const requestBuild = require( './requestBuild' );
const winston = require( 'winston' );

// for debug purposes, it is possible to configure Rosetta to skip sending build requests to the build server
const SEND_BUILD_REQUESTS = global.config.sendBuildRequests === undefined ? true : global.config.sendBuildRequests;

/**
 * task queue into which translation requests are pushed
 * @public
 */
module.exports.stringSubmissionQueue = async ( req, res ) => {
  const { targetLocale } = req.params;
  const { simName } = req.params;
  const userId = ( req.session.userId ) ? req.session.userId : 0;

  // Define an object that will contain the sets of strings that need to be stored.  The keys for this object will be
  // the sim or library name, aka the 'repo', and the strings will be in the form needed for long term string storage.
  // Multiple sims and/or libraries may need to be committed as part of a single translation due to shared code.
  const stringSets = {};

  // flags for checking if strings have changed for a given sim or lib
  const stringsChangedFlags = {};

  // Extract the string sets from the submitted translation.  The body of the request (req.body) contains an object with
  // all of the strings submitted through the POST request from the translation utility. The keys are in the form
  // "[repository] [key]" and the values are the strings, for example: "chains chains.title": "Chains".
  _.keys( await req.body ).forEach( submittedStringKey => {

    // data submitted is in the form "[repository] [key]", for example "area-builder area-builder.title"
    const repoAndStringKey = submittedStringKey.split( ' ' );
    const repo = repoAndStringKey[ 0 ];
    const stringKey = repoAndStringKey[ 1 ];

    // if this sim or lib isn't represent yet, add it
    if ( !stringSets[ repo ] ) {
      stringSets[ repo ] = {};
    }

    // get the value of the string
    let stringValue = req.body[ submittedStringKey ];

    // Handle any embedded line feeds. There is some history here, please see
    // https://github.com/phetsims/rosetta/issues/144 and https://github.com/phetsims/rosetta/issues/207. The best
    // thing to do going forward is to always use <br> in multi-line strings instead of '\n', this code is here to
    // handle older sims in which '\n' was used in multi-line strings.
    if ( stringValue.indexOf( '\\n' ) !== -1 ) {
      winston.info( 'replacing line feed sequence in string from repo ' + repo + ' with key ' + stringKey );
      stringValue = stringValue.replace( /\\n/g, '\n' );
    }

    // check if the string is already in translatedStrings to get the history if it exists
    const translatedString = req.session.translatedStrings[ targetLocale ] &&
                             req.session.translatedStrings[ targetLocale ][ repo ] &&
                             req.session.translatedStrings[ targetLocale ][ repo ][ stringKey ];
    let history = translatedString && translatedString.history;
    const oldValue = ( history && history.length ) ? history[ history.length - 1 ].newValue : '';

    // only add the update if the value has changed
    if ( oldValue !== stringValue ) {
      const newHistoryEntry = {
        userId: ( req.session.userId ) ? req.session.userId : 'phet-test',
        timestamp: Date.now(),
        oldValue: oldValue,
        newValue: stringValue,
        explanation: null // TODO - add support for explanations to Rosetta
                          // This needs an issue link.
      };

      if ( history ) {
        history.push( newHistoryEntry );
      }
      else {
        history = [ newHistoryEntry ];
      }
      stringSets[ repo ][ stringKey ] = {
        value: stringValue,
        history: history
      };

      // set flag indicating that a string has changed
      if ( !stringsChangedFlags[ repo ] ) {
        stringsChangedFlags[ repo ] = true;
      }
    }
    else if ( translatedString ) {
      stringSets[ repo ][ stringKey ] = translatedString;
    }
  } );

  // make a list of only the string sets that have changed
  const changedStringSets = _.pick( stringSets, _.keys( stringsChangedFlags ) );

  // save the modified strings to long-term storage
  const stringSavePromises = [];
  _.keys( changedStringSets ).forEach( simOrLibName => {
    stringSavePromises.push(
      longTermStringStorage.saveTranslatedStrings( simOrLibName, targetLocale, changedStringSets[ simOrLibName ] )
    );
  } );

  // wait for all the save operations to complete
  try {

    // wait for all the save operations to complete
    await Promise.all( stringSavePromises );

  }
  catch( err ) {

    winston.error( 'error while submitting strings, err = ' + err );
    winston.info( 'rendering error page' );

    // render an error page
    res.render( 'error.html', {
      title: 'Translation Utility Error',
      message: 'An error occurred when trying to save the translated strings.',
      errorDetails: err,
      timestamp: new Date().getTime()
    } );

    // bail out
    return;
  }

  try {

    // request a build of the new translation (if enabled)
    if ( SEND_BUILD_REQUESTS ) {
      await requestBuild( simName, targetLocale, userId );
    }
    else {
      winston.info( 'build requests for translations are disabled, skipping' );
    }

    // clear out short-term storage, since these strings have now been successfully stored in the long-term area
    await deleteStringsFromDB( userId, targetLocale, _.keys( stringSets ) ).catch();

    // render the page that indicates that the translation was successfully submitted
    res.render( 'translation-submit.html', {
      title: 'Translation submitted',
      simName: simName,
      targetLocale: targetLocale
    } );
  }
  catch( err ) {

    winston.error( 'error while requesting build and clearing out DB, err = ' + err );
    winston.info( 'rendering error page' );

    // render an error page
    res.render( 'error.html', {
      title: 'Translation Utility Error',
      message: 'An error occurred when trying to build the new simulation.',
      errorDetails: err,
      timestamp: new Date().getTime()
    } );
  }

};

/**
 * delete the strings that are stored in short-term storage
 * {string} userID
 * {string} locale
 * {string[]} simOrLibNames
 * @private
 */
async function deleteStringsFromDB( userID, locale, simOrLibNames ) {

  winston.info(
    'removing strings from short term storage for userID = ' + userID + ', sim/libs = ' + simOrLibNames + ', locale = ' + locale
  );

  // create a string with all the repo names that can be used in the SQL query
  let simOrLibNamesString = '';
  simOrLibNames.forEach( ( simOrLibName, index ) => {
    simOrLibNamesString += 'repository = ' + '\'' + simOrLibName + '\'';
    if ( index < simOrLibNames.length - 1 ) {
      simOrLibNamesString += ' OR ';
    }
  } );

  const deleteQuery = 'DELETE FROM saved_translations WHERE user_id = $1 AND locale = $2 AND (' + simOrLibNamesString + ')';
  const pool = new Pool( {
    connectionTimeoutMillis: 2000
  } );
  try {
    winston.info( 'attempting query: ' + deleteQuery );
    await pool.query( deleteQuery, [ userID, locale ] );
    winston.info( 'deletion of strings succeeded' );
  }
  catch( err ) {
    winston.error( 'deletion of strings failed, err = ' + err );
  }
}