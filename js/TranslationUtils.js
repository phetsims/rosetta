// Copyright 2015-2020, University of Colorado Boulder

/**
 * This file holds various utilities useful for translation.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

'use strict';

// Node modules
const _ = require( 'lodash' ); // eslint-disable-line
const axios = require( 'axios' );
const email = require( 'emailjs/email' );
const simData = require( './simData' );
const winston = require( 'winston' );

// server modules
const RosettaConstants = require( './RosettaConstants' );

// constants
const preferences = global.config;
const STRING_VAR_IN_HTML_FILES = RosettaConstants.STRING_VAR_IN_HTML_FILES;

//===========================================================================//
// Email functions.                                                          //
//===========================================================================//

// Configure email server if credentials are present.
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
 * Send an email if server is defined. Used to notify developers push to Babel (the string repo) fails.
 *
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
    }, function( error, message ) {
      if ( error ) {
        winston.error( `Unable to send email. Error: ${error}.` );
      }
      else {
        console.log( `Email sent! Email Body: ${message}` );
      }
    } );
  }
  else {
    winston.warn( 'emailServer evaluated false. Email not sent!' );
  }
}

//===========================================================================//
// Utility functions below.                                                  //
//===========================================================================//

/**
 * For presenting escaped HTML. Also escapes newline character.
 *
 * @param {String} htmlString
 * @returns {String}
 */
function escapeHtml( htmlString ) {

  return htmlString.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /\n/g, '&#92;n' );
}

/**
 * Extracts sim's SHA from its HTML.
 *
 * @param {string} simHtml - HTML of the built sim
 * @param {string} simName - sim name in "repo" format, e.g. "acid-base-solutions"
 * @returns {string} SHA of built sim
 */
function extractSimSha( simHtml, simName ) {

  // Get the SHA of this version of the sim
  const simShaInfo = new RegExp( '"' + simName + '": {\\s*"sha": "(\\w*)",\\s*"branch": "(\\w*)"', 'g' ).exec( simHtml );
  return ( simShaInfo && simShaInfo.length > 1 ) ? simShaInfo[ 1 ] : 'master'; // Default to master if no SHA is found.
}

/**
 * Extract all sim keys used in the provided built sim HTML and format them into a structured object.
 *
 * @param {string} simHtml - HTML of the built sim
 * @returns {Map<{String,String[]}>} - a map with project names for keys (e.g. "build-an-atom") and an array of all the
 * string keys used for that project
 */
function extractStringKeys( simHtml ) {

  // Extract the line from the HTML file that defines the value of the global strings variable.
  const regEx = new RegExp( STRING_VAR_IN_HTML_FILES + '.*$', 'm' );
  const stringVariableAssignmentStatement = simHtml.match( regEx );

  // Extract the value (i.e. right side) of this assignment statement, which should consist of JSON string keys and
  // values.
  const stringsVariableJson = stringVariableAssignmentStatement[ 0 ]
    .replace( STRING_VAR_IN_HTML_FILES + ' = ', '' )
    .replace( /;$/m, '' );

  // Convert the JSON string to an object.
  const stringsVariableValue = JSON.parse( stringsVariableJson );

  // Create the Map that will be returned. It will be populated below.
  const extractedStringsMap = new Map();

  // Make sure the English string values are present and use only those.
  if ( stringsVariableValue.en ) {

    _.keys( stringsVariableValue.en ).forEach( projectAndStringKey => {

      // Separate the project name and string key from the combined key. Convert string key to the "repo" format.
      const splitProjectAndStringKey = projectAndStringKey.split( '/' );
      const projectName = splitProjectAndStringKey[ 0 ].replace( new RegExp( '_', 'g' ), '-' ).toLowerCase();
      const stringKey = splitProjectAndStringKey[ 1 ];

      // Find or create the string key array for this project.
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

//===========================================================================//
// GitHub API functions below.                                               //
//===========================================================================//

// For a nicer looking stringify. Also ensures a sorted JSON string.
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
 * Get the HTML of the latest published version of the sim from the sever.
 *
 * @param {string} simName
 * @returns {Promise.<string>} - HTML of the published simulation
 * @rejects {Error}
 */
async function getLatestSimHtml( simName ) {

  // Compose the URL for the latest English version of the simulation.
  const simUrl = await simData.getLiveSimUrl( simName );

  // Get the sim's HTML.
  try {
    const simHtml = await axios.get( simUrl );
    winston.debug( 'Got sim HTML.' );
    return simHtml.data;
  }
  catch( error ) {
    const errorMessage = `Unable to get sim HTML. ${error.message}`;
    winston.error( errorMessage );
    throw new Error( errorMessage );
  }
}

// Export all functions in this file.
module.exports = {
  escapeHtml: escapeHtml,
  extractSimSha: extractSimSha,
  extractStringKeys: extractStringKeys,
  getLatestSimHtml: getLatestSimHtml,
  sendEmail: sendEmail,
  stringify: stringify
};
