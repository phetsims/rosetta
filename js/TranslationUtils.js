// Copyright 2015-2019, University of Colorado Boulder

/**
 * This file holds various utilities useful for translation.
 *
 * @author Aaron Davis
 * @author John Blanco
 */

'use strict';

const _ = require( 'lodash' ); // eslint-disable-line
const email = require( 'emailjs/email' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const simData = require( './simData' );
const winston = require( 'winston' );

// globals
const preferences = global.config;

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
 * @returns {Object[]|null} - an array of objects of the form { projectName: {string}, stringKeys: {string[]}} that list
 * the strings used for each string-containing repo used by the sim, null if no strings found
 */
function extractStringKeys( simHtml ) {

  // use a regular expression to extract all the string keys by matching uses of the string plugin
  const matches = simHtml.match( /string!([\w./-]+)/g );

  // if no matches are found, it probably means the sim url was not correct
  if ( matches === null ) {
    return null;
  }

  const projects = {};
  for ( let i = 0; i < matches.length; i++ ) {
    const projectAndString = matches[ i ].substring( 7 ).split( '/' );
    const projectName = projectAndString[ 0 ];
    const string = projectAndString[ 1 ];

    projects[ projectName ] = projects[ projectName ] || [];

    if ( !_.includes( projects[ projectName ], string ) ) {
      projects[ projectName ].push( string );
    }
  }

  const extractedStrings = [];
  for ( const project in projects ) {

    if ( !projects.hasOwnProperty( project ) ) { continue; }

    extractedStrings.push( {
      projectName: project.replace( new RegExp( '_', 'g' ), '-' ).toLowerCase(),
      stringKeys: projects[ project ]
    } );
  }

  return extractedStrings;
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
