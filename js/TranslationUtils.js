// Copyright 2015-2020, University of Colorado Boulder

/**
 * This file holds various utilities useful for translation.
 *
 * @author Aaron Davis
 * @author John Blanco
 */

'use strict';

// node modules
const _ = require( 'lodash' ); // eslint-disable-line
const email = require( 'emailjs/email' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const simData = require( './simData' );
const winston = require( 'winston' );

// server modules
const RosettaConstants = require( './RosettaConstants' );

// constants
const preferences = global.config;
const STRING_VAR_IN_HTML_FILES = RosettaConstants.STRING_VAR_IN_HTML_FILES;

/*---------------------------------------------------------------------------*
 * Email utilities
 *---------------------------------------------------------------------------*/

// configure email server if credentials are present
let emailServer;
if ( preferences.emailUsername && preferences.emailPassword && preferences.emailServer && preferences.emailTo ) {
  emailServer = email.server.connect( {
    user: preferences.emailUsername,
    password: preferences.emailPassword,
    host: preferences.emailServer,
    tls: preferences.tls || true
  } );
}

/**
 * send an email if server is defined, used to notify developers push to babel (the string repo) fails
 * @param subject
 * @param text
 */
function sendEmail( subject, text ) {

  if ( emailServer ) {
    emailServer.send( {
      text: text,
      from: 'PhET Translation Utility (rosetta) <phethelp@colorado.edu>',
      to: preferences.emailTo,
      subject: subject
    }, function( err, message ) {
      if ( err ) {
        console.log( 'error sending email', err );
      }
      else {
        console.log( 'send email', message );
      }
    } );
  }
  else {
    winston.warn( 'email not sent because server credentials were not present in preferences file' );
  }
}

/*---------------------------------------------------------------------------*
 * Utility functions
 *---------------------------------------------------------------------------*/

/**
 * utility function for presenting escaped HTML, also escapes newline character
 * @param {String} s
 * @returns {String}
 */
function escapeHTML( s ) {

  return s.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /\n/g, '&#92;n' );
}

/**
 * render an error page
 * @param {Object} res - response object, used for rendering the response
 * @param {String} message
 * @param {String} err
 */
function renderError( res, message, err ) {

  res.render( 'error.html', {
    title: 'Translation Utility Error',
    message: message,
    errorDetails: err,
    timestamp: new Date().getTime()
  } );
}

/**
 * extract the SHA of this sim from the built HTML file
 * @param {string} simHtml - HTML of the built sim
 * @param {string} simName - sim name in "repo" format, e.g. "acid-base-solutions"
 * @returns {string} SHA of this built sim
 */
function extractSimSha( simHtml, simName ) {

  // get the SHA of this version of the sim
  const simShaInfo = new RegExp( '"' + simName + '": {\\s*"sha": "(\\w*)",\\s*"branch": "(\\w*)"', 'g' ).exec( simHtml );
  return ( simShaInfo && simShaInfo.length > 1 ) ? simShaInfo[ 1 ] : 'master'; // default to master if no sha is found
}

/**
 * extract all sim keys used in the provided built sim HTML and format them into a structured object
 * @param {string} simHtml - HTML of the built sim
 * @returns {Map<{String,String[]}>} - a map with project names for keys (e.g. 'build-an-atom') and an array of all the
 * string keys used for that project
 */
function extractStringKeys( simHtml ) {

  // extract the line from the HTML file that defines the value of the global strings variable
  const regEx = new RegExp( STRING_VAR_IN_HTML_FILES + '.*$', 'm' );
  const stringVariableAssignmentStatement = simHtml.match( regEx );

  // extract the value (i.e. right side) of this assignment statement, which should consist of JSON string keys and values
  const stringsVariableJson = stringVariableAssignmentStatement[ 0 ]
    .replace( STRING_VAR_IN_HTML_FILES + ' = ', '' )
    .replace( /;$/m, '' );

  // convert the JSON string to an object
  const stringsVariableValue = JSON.parse( stringsVariableJson );

  // create the Map that will be returned, it will be populated below
  const extractedStringsMap = new Map();

  // make sure the English string values are present, and use only those
  if ( stringsVariableValue.en ) {

    _.keys( stringsVariableValue.en ).forEach( projectAndStringKey => {

      // separate the project name and string key from the combined key, convert string key to the "repo name" format
      const splitProjectAndStringKey = projectAndStringKey.split( '/' );
      const projectName = splitProjectAndStringKey[ 0 ].replace( new RegExp( '_', 'g' ), '-' ).toLowerCase();
      const stringKey = splitProjectAndStringKey[ 1 ];

      // find or create the string key array for this project
      let stringKeys = extractedStringsMap.get( projectName );
      if ( !stringKeys ) {
        stringKeys = [];
        extractedStringsMap.set( projectName, stringKeys );
      }

      stringKeys.push( stringKey );
    } );
  }
  else {
    winston.error( 'no English string keys found in provided sim HTML' );
  }

  return extractedStringsMap;
}

/*---------------------------------------------------------------------------*
 * Github API functions
 *---------------------------------------------------------------------------*/

// convenience for a nicer looking stringify, also ensures a sorted JSON string
function stringify( data ) {

  const keys = [];
  let key;
  if ( data ) {
    for ( key in data ) {
      keys.push( key );
    }
  }
  keys.sort();
  const sortedData = {};
  for ( const index in keys ) {
    key = keys[ index ];
    sortedData[ key ] = data[ key ];
  }
  return JSON.stringify( sortedData, null, 2 );
}

/**
 * get the HTML of the latest published version of the sim from the sever
 * @param {string} simName
 * @returns {Promise.<string>} - html of the published simulation
 * @rejects {Error}
 */
async function getLatestSimHtml( simName ) {

  // compose the URL for the latest English version of the simulation
  const simUrl = await simData.getLiveSimUrl( simName );

  const response = await nodeFetch( simUrl );

  // handle the response
  if ( response.status === 200 ) {

    // the sim was obtained successfully
    return response.text();
  }
  else if ( response.status === 404 ) {
    return Promise.reject( new Error( 'sim not found (response.status = ' + response.status ) + ')' );
  }
  else {
    return Promise.reject( new Error( 'error getting sim (response.status = ' + response.status ) + ')' );
  }
}

// export all functions in this file
module.exports = {
  escapeHTML: escapeHTML,
  extractSimSha: extractSimSha,
  extractStringKeys: extractStringKeys,
  getLatestSimHtml: getLatestSimHtml,
  renderError: renderError,
  sendEmail: sendEmail,
  stringify: stringify
};
