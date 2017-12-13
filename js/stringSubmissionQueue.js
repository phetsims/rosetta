// Copyright 2015, University of Colorado Boulder

/**
 * An asynchronous (async.queue) queue with a concurrency of one (meaning that only one task is executed at a time)
 * that is used to serialize submissions of strings for a translation.
 *
 * @author Aaron Davis
 * @author John Blanco
 */
/* eslint-env node */
'use strict';

// modules
const async = require( 'async' );
const fs = require( 'fs' );
const LocaleInfo = require( './LocaleInfo' );
const LongTermStringStorage = require( './LongTermStringStorage' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const query = require( 'pg-query' ); // eslint-disable-line
const querystring = require( 'querystring' );
const winston = require( 'winston' );
const _ = require( 'underscore' ); // eslint-disable-line

// constants
const HTML_SIMS_DIRECTORY = global.preferences.htmlSimsDirectory;

/**
 * task queue into which translation request are pushed
 * @public
 */
module.exports.stringSubmissionQueue = async.queue( function( task, taskCallback ) {

  const req = task.req;
  const res = task.res;
  const targetLocale = req.params.targetLocale;
  const simName = req.params.simName;
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
  _.keys( req.body ).forEach( function( submittedStringKey ) {

    // data submitted is in the form "[repository] [key]", for example "area-builder area-builder.title"
    let repoAndStringKey = submittedStringKey.split( ' ' );
    let repo = repoAndStringKey[ 0 ];
    let stringKey = repoAndStringKey[ 1 ];

    // if this sim or lib isn't represent yet, add it
    if ( !stringSets[ repo ] ){
      stringSets[ repo ] = {};
    }

    // get the value of the string
    let stringValue = req.body[ submittedStringKey ];

    // check if the string is already in translatedStrings to get the history if it exists
    let translatedString = req.session.translatedStrings[ targetLocale ] &&
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
      let newHistoryEntry = {
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
      stringSets[repo][ stringKey ] = {
        value: stringValue,
        history: history
      };

      // set flag indicating that a string has changed
      if ( !stringsChangedFlags[ repo ] ) {
        stringsChangedFlags[ repo ] = true;
      }
    }
    else if ( translatedString ) {
      stringSets[repo][ stringKey ] = translatedString;
    }
  } );

  // make a list of only the string sets that have changed
  const changedStringSets = _.pick( stringSets, _.keys( stringsChangedFlags ) );

  // save the modified strings to long-term storage
  let stringSavePromises = [];
  _.keys( changedStringSets ).forEach( function( simOrLibName ) {
    stringSavePromises.push(
      LongTermStringStorage.saveStrings( simOrLibName, targetLocale, changedStringSets[ simOrLibName ] )
    );
  } );

  // when all the save operations are complete, build the new or updated translation
  Promise.all( stringSavePromises )
    .then( results => {

      // request the build from the build server
      requestBuild( simName, userId, targetLocale )
        .then( () => {

          // render the page that indicates that the translation was successfully submitted
          const localeInfo = LocaleInfo.localeInfoObject[ targetLocale ];
          res.render( 'translation-submit.html', {
            title: 'Translation submitted',
            stringsNotSubmitted: results.length > 0,
            timestamp: new Date().getTime(),
            simName: simName,
            targetLocale: targetLocale,
            direction: localeInfo ? localeInfo.direction : 'ltr'
          } );

          taskCallback();
        } )
        .catch( ( err ) => {

          // render an error page
          res.render( 'error.html', {
            title: 'Translation Utility Error',
            message: 'An error occurred when trying to build and deploy the translation.',
            errorDetails: err,
            timestamp: new Date().getTime()
          } );

          taskCallback();
        } );

      // clear out short-term storage, since these strings were successfully stored in the long-term area
      deleteStringsFromDB( userId, targetLocale, _.keys( stringSets ) );
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
}, 1 );

/**
 * delete the strings that are stored in short-term storage
 * @private
 */
function deleteStringsFromDB( userID, locale, simOrLibNames ) {

  winston.log( 'info', 'removing strings from short term storage for userID = ' + userID + ', locale = ' + locale );

  const simOrLibNamesString = simOrLibNames.join( ' OR ' );

  const deleteQuery = 'DELETE FROM saved_translations WHERE user_id = $1 AND locale = $2 AND (' + simOrLibNamesString + ')';
  winston.log( 'info', 'running SQL command: ' + deleteQuery );
  query( deleteQuery, [ userID, locale ], function( err ) {
    if ( !err ) {
      winston.log( 'info', 'successfully deleted saved strings' );
    }
    else {
      winston.log( 'error', 'problem while trying to remove strings from short term storage, err = ' + err );
    }
  } );
}

/**
 * get the latest version of the specified simulation by looking at the directory structure of published sims
 * @param simName
 * @return {string}
 * @private
 */
function getLatestSimVersion( simName ){

  // get the directory names in this sim's directory, should mostly be version numbers
  let versions = fs.readdirSync( HTML_SIMS_DIRECTORY + '/' + simName );

  // filter out anything that doesn't look like a version identifier (example of valid version ID is 1.2.3)
  versions = versions.filter( function( dirName ) {
    const dirNameTokenized = dirName.split( '.' );
    if ( dirNameTokenized.length !== 3 ) {
      return false;
    }
    for ( let i = 0; i < 3; i++ ) {
      if ( isNaN( dirNameTokenized[ i ] ) ) {
        return false;
      }
    }
    return true;
  } );

  // sort the list of version identifiers from oldest to newest, necessary because default order is lexicographic
  versions.sort( function( a, b ) {
    const aTokenized = a.split( '.' );
    const bTokenized = b.split( '.' );
    let result = 0;
    for ( let i = 0; i < aTokenized.length; i++ ) {
      if ( parseInt( aTokenized[ i ], 10 ) < parseInt( bTokenized[ i ], 10 ) ) {
        result = -1;
        break;
      }
      else if ( parseInt( aTokenized[ i ], 10 ) > parseInt( bTokenized[ i ], 10 ) ) {
        result = 1;
        break;
      }
    }
    return result;
  } );

  // get the latest version identifier
  return versions[ versions.length - 1 ];
}

/**
 * request a build from the build server
 * @return Promise
 * @private
 */
function requestBuild( simName, userID, locale ){

  try {

    // get the latest version identifier
    const version = getLatestSimVersion( simName );
    winston.log( 'info', 'latest version found for sim ' + simName + ' = ' + version );

    // get the dependencies and turn them into a string
    // TODO: Why is this a require and not a synchronous read?
    const dependencies = require( HTML_SIMS_DIRECTORY + simName + '/' + version + '/dependencies.json' );
    const queryString = querystring.stringify( {
      'repos': JSON.stringify( dependencies ),
      'simName': simName,
      'version': version,
      'locales': locale,
      'serverName': global.preferences.productionServerName,
      'authorizationCode': global.preferences.buildServerAuthorizationCode,
      'userId': userID
    } );

    // compose the URL for the build request
    const url = global.preferences.productionServerURL + '/deploy-html-simulation?' + queryString;

    // send off the request, and return the resulting promise
    return nodeFetch.reqest( url );
  }
  catch( e ) {
    return Promise.reject( 'problem requesting build from build server, error = ' + e );
  }
}
