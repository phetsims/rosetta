// Copyright 2015, University of Colorado Boulder

/**
 * An asynchronous (async.queue) queue with a concurrency of one (meaning that only one task is executed at a time)
 * that is used to serialize submissions of strings for a translation.
 *
 * @author Aaron Davis
 * @author John Blanco
 */

'use strict';

// modules
// const async = require( 'async' );
const _ = require( 'underscore' ); // eslint-disable-line
const LongTermStringStorage = require( './LongTermStringStorage' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const query = require( 'pg-query' ); // eslint-disable-line
const RosettaConstants = require( './RosettaConstants' );
const simData = require( './simData' );
const winston = require( 'winston' );

// constants
const PRODUCTION_SERVER_URL = RosettaConstants.PRODUCTION_SERVER_URL;
const SKIP_BUILD_REQUEST = typeof global.preferences.debugRosettaSkipBuildRequest !== 'undefined' &&
                           global.preferences.debugRosettaSkipBuildRequest === 'true';

// TODO: Remove this comment (it's a change that was committed to the new chipper-2.0 branch to test it out).

/**
 * task queue into which translation request are pushed
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
    const stringValue = req.body[ submittedStringKey ];

    // check if the string is already in translatedStrings to get the history if it exists
    const translatedString = req.session.translatedStrings[ targetLocale ] &&
                           req.session.translatedStrings[ targetLocale ][ repo ] &&
                           req.session.translatedStrings[ targetLocale ][ repo ][ stringKey ];
    let history = translatedString && translatedString.history;
    let oldValue = ( history && history.length ) ? history[ history.length - 1 ].newValue : '';

    // handle special case of multi-line string
    if ( oldValue.indexOf( '\n' ) > -1 ) {
      // TODO: temp debug code for issue #144, remove once issue is resolved.
      winston.log( 'info', 'detected multi-line string' );
      winston.log( 'info', 'oldValue = ' + oldValue );
      winston.log( 'info', 'prior to replace operation, oldValue === stringValue = ' + ( oldValue === stringValue ) );
      // TODO: end of first debug code section
      oldValue = oldValue.replace( /\n/g, '\\n' );
      // TODO: temp debug code for issue #144, remove once issue is resolved.
      winston.log( 'info', 'oldValue (after replace operation) = ' + oldValue );
      winston.log( 'info', 'after the replace operation, oldValue === stringValue = ' + ( oldValue === stringValue ) );
      // TODO: end of second debug code section
    }

    // only add the update if the value has changed
    if ( oldValue !== stringValue ) {
      const newHistoryEntry = {
        userId: ( req.session.userId ) ? req.session.userId : 'phet-test',
        timestamp: Date.now(),
        oldValue: oldValue,
        newValue: stringValue,
        explanation: null // TODO
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
  _.keys( await changedStringSets ).forEach( simOrLibName => {
    stringSavePromises.push(
      LongTermStringStorage.saveStrings( simOrLibName, targetLocale, changedStringSets[ simOrLibName ] )
    );
  } );

  // when all the save operations are complete, build the new or updated translation
  return Promise.all( stringSavePromises )
    .then( results => {

      // request the build from the build server
      requestBuild( simName, userId, targetLocale )
        .then( () => {

          winston.log( 'info', 'build request successfully submitted to build server' );

          // render the page that indicates that the translation was successfully submitted
          res.render( 'translation-submit.html', {
            title: 'Translation submitted',
            simName: simName,
            targetLocale: targetLocale
          } );
        } )
        .catch( ( err ) => {

          winston.log( 'error', 'problem building translation, err = ' + err );

          // render an error page
          res.render( 'error.html', {
            title: 'Translation Utility Error',
            message: 'An error occurred when trying to build and deploy the translation.',
            errorDetails: err,
            timestamp: new Date().getTime()
          } );
        } );

      // clear out short-term storage, since these strings were successfully stored in the long-term area
      deleteStringsFromDB( userId, targetLocale, _.keys( stringSets ) ).catch(  );
    } )
    .catch( err => {

      // render an error page
      res.render( 'error.html', {
        title: 'Translation Utility Error',
        message: 'An error occurred when trying to save the translated strings.',
        errorDetails: err,
        timestamp: new Date().getTime()
      } );
    } );
};

/**
 * delete the strings that are stored in short-term storage
 * @private
 */
async function deleteStringsFromDB( userID, locale, simOrLibNames ) {

  winston.log(
    'info',
    'removing strings from short term storage for userID = ' + userID + ', sim/libs = ' + simOrLibNames + ', locale = ' + locale
  );

  const simOrLibNamesString = simOrLibNames.join( ' OR ' );

  const deleteQuery = 'DELETE FROM saved_translations WHERE user_id = $1 AND locale = $2 AND (' + simOrLibNamesString + ')';
  winston.log( 'info', 'running SQL command: ' + deleteQuery );
  query( deleteQuery, [ userID, locale ], function( err ) {
    if ( !err ) {
      winston.log( 'info', 'successfully deleted saved strings' );
      return true;
    }
    else {
      winston.log( 'warning', 'problem while trying to remove strings from short term storage, err = ' + err );
      return false;
    }
  } );
}

/**
 * @param {string} simName
 * @param {string} version
 * @returns {Promise.<string>} - JSON data with dependencies
 */
async function getDependencies( simName, version ) {
  const URL = PRODUCTION_SERVER_URL +
              '/sims/html/' +
              simName +
              '/' +
              version +
              '/dependencies.json';
  const response = await nodeFetch( URL );
  if ( response.status === 200 ) {
    return await response.text();
  }
  else {
    throw new Error( 'unable to get dependencies for sim ' + simName + ', version ' + version + '; response.status = ' + response.status );
  }
}

/**
 * request a build from the build server
 * @returns {Promise}
 * @private
 */
async function requestBuild( simName, userID, locale ) {

  winston.log( 'info', 'build requested for sim = ' + simName + ', locale = ' + locale );
  const latestVersionOfSim = await simData.getLatestSimVersion( simName );
  winston.log( 'info', 'latest sim version = ' + latestVersionOfSim );
  const dependencies = await getDependencies( simName, latestVersionOfSim );
  const requestObject = {
    api: '2.0',
    dependencies: dependencies,
    simName: simName,
    version: latestVersionOfSim,
    locales: [ locale ],
    servers: [ 'production' ],
    brands: [ 'phet' ],
    translatorId: userID,
    authorizationCode: global.preferences.buildServerAuthorizationCode
  };

  const url = PRODUCTION_SERVER_URL + '/deploy-html-simulation';

  if ( !SKIP_BUILD_REQUEST ) {

    winston.log( 'info', 'sending build request to server, URL = ' + url );

    // send off the request, and return the resulting promise
    const buildRequestResponse = await nodeFetch( url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify( requestObject )
    } );
    if ( buildRequestResponse.status === 200 || buildRequestResponse.status === 202 ) {
      winston.log( 'info', 'build request accepted, status = ' + buildRequestResponse.status );
      return true;
    }
    else if ( buildRequestResponse.status === 400 ) {
      throw new Error( 'build request unsuccessful, probably due to missing info, status = ' + buildRequestResponse.status );
    }
    else if ( buildRequestResponse.status === 401 ) {
      throw new Error( 'build request unsuccessful, probably due to bad auth code, status = ' + buildRequestResponse.status );
    }
    else {
      throw new Error( 'build request unsuccessful, status = ' + buildRequestResponse.status );
    }
  }
  else {

    // The build request is being skipped due to the setting of a debug flag.  This capability was added to allow the
    // build request to be debugged without sending a bunch of bogus requests to the build server.
    winston.log( 'warn', 'build request skipped due to setting of debug flag' );
  }
}
