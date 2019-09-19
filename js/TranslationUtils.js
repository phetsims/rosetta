// Copyright 2015-2019, University of Colorado Boulder

/**
 * This file holds various utilities useful for translation.
 *
 * @author Aaron Davis
 * @author John Blanco
 */

'use strict';

const _ = require( 'underscore' ); // eslint-disable-line
const email = require( 'emailjs/email' );
const https = require( 'https' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const octonode = require( 'octonode' );
const RosettaConstants = require( './RosettaConstants' );
const winston = require( 'winston' );

// globals
const preferences = global.preferences;

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
    winston.log( 'warn', 'email not sent because server credentials were not present in preferences file' );
  }
}

/*---------------------------------------------------------------------------*
 * Utility functions
 *---------------------------------------------------------------------------*/

// utility function for presenting escaped HTML, also escapes newline character
function escapeHTML( s ) {

  return s.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /\n/g, '&#92;n' );
}

function renderError( res, message, err ) {

  res.render( 'error.html', {
    title: 'Translation Utility Error',
    message: message,
    errorDetails: err,
    timestamp: new Date().getTime()
  } );
}

function extractStrings( data, simName ) {

  const projects = {};
  const matches = data.match( /string!([\w./-]+)/g );

  // if no matches are found, it probably means the sim url was not correct
  if ( matches === null ) {
    return null;
  }

  const simShaInfo = new RegExp( '"' + simName + '": {\\s*"sha": "(\\w*)",\\s*"branch": "(\\w*)"', 'g' ).exec( data );
  const sha = ( simShaInfo && simShaInfo.length > 1 ) ? simShaInfo[ 1 ] : 'master'; // default to master if no sha is found

  for ( let i = 0; i < matches.length; i++ ) {
    const projectAndString = matches[ i ].substring( 7 ).split( '/' );
    const projectName = projectAndString[ 0 ];
    const string = projectAndString[ 1 ];

    projects[ projectName ] = projects[ projectName ] || [];

    if ( !_.includes( projects[ projectName ], string ) ) {
      projects[ projectName ].push( string );
    }
  }

  const result = { extractedStrings: [], sha: sha };
  for ( const project in projects ) {
    result.extractedStrings.push( {
      projectName: project.replace( new RegExp( '_', 'g' ), '-' ).toLowerCase(),
      stringKeys: projects[ project ]
    } );
  }

  return result;
}

/**
 * Route that extracts strings from a built sim. Expects query parameter 'simUrl', the url of the built sim to
 * extract the strings from. Requests are made via https. Do not include to protocol in the simUrl parameter.
 *
 * Example simUrl values:
 * - www.colorado.edu/physics/phet/dev/html/arithmetic/1.0.0-dev.13/arithmetic_en.html
 * - localhost:8000/color-vision/build/color-vision_en.html
 * - phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html
 *
 * @param req
 * @param res
 */
function extractStringsAPI( req, res ) {

  // included for an easy default test
  const url = req.params.simUrl || 'phet-dev.colorado.edu/sims/html/molecules-and-light/latest/molecules-and-light_en.html';
  const localhost = ( url.indexOf( 'localhost' ) === 0 );

  const slashIndex = url.indexOf( '/' );
  const host = ( localhost ) ? 'localhost' : url.substring( 0, slashIndex );
  const path = url.substring( slashIndex );

  const urlSplit = url.split( '/' );
  const simName = urlSplit[ urlSplit.length - 1 ].split( '_' )[ 0 ];

  const options = {
    host: host,
    path: path,
    method: 'GET'
  };

  // if running locally get the port number if it is part of the url
  if ( localhost ) {
    const colonIndex = url.indexOf( ':' );
    if ( colonIndex > -1 ) {
      options.port = url.substring( colonIndex + 1, slashIndex );
    }
  }

  winston.log( 'info', 'requesting sim at host: ' + options.host + ', port: ' + options.port + ', and path: ' + options.path );

  const sessionDataRequestCallback = function( response ) {
    let data = '';

    // another chunk of data has been received, so append it
    response.on( 'data', function( chunk ) {
      data += chunk;
    } );

    // the whole response has been received
    response.on( 'end', function() {
      const result = extractStrings( data, simName );

      if ( !result ) {
        renderError( res, 'Tried to extract strings from an invalid URL', 'url: ' + host + path );
      }
      else {
        res.setHeader( 'Content-Type', 'application/json' );
        res.end( JSON.stringify( result, null, 2 ) );
      }
    } );
  };

  const strings = https.request( options, sessionDataRequestCallback );

  strings.on( 'error', function( err ) {
    winston.log( 'error', 'Error getting sim strings - ' + err );
    res.render( 'error.html', {
        title: 'Translation Utility Error',
        message: 'Unable to obtain sim strings',
        errorDetails: err,
        timestamp: new Date().getTime()
      }
    );
  } );

  // send the request
  strings.end();
}

/**
 * get the metadata for the specified simulation
 * @param {string} simName
 * @returns {Promise.<string>}
 */
async function getSimInfo( simName ) {

  const URL = RosettaConstants.PRODUCTION_SERVER_URL +
              '/services/metadata/1.2/simulations?format=json&type=html&locale=en&simulation=' +
              simName +
              '&summary';
  const response = await nodeFetch( URL );
  const responseJSON = await response.json();
  return responseJSON;
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
 * Check if a string files has changed versus the version of it on GitHub and, if so, push the updated version.
 *
 * @param {Object} repo - handle to a GitHub repo, return value from ghClient.repo()
 * @param {string} file - string file to be added or modified (must include the full path from the repo root)
 * @param {string} content - file contents
 * @param {string} message - commit message
 * @param {string} branch - branch of babel, will usually be 'master', but sometimes 'tests'
 * @param {function} callback
 */
function checkAndUpdateStringFile( repo, file, content, message, branch, callback ) {

  if ( !branch ) {
    branch = 'master';
  }

  // get the current contents of the file from github
  repo.contents( file, branch, function( err, data, headers ) {

    // if the file is not found, create a new one
    if ( err ) {
      winston.log( 'info', 'no file found: ' + file + '. Attempting to create.' );

      if ( content !== '{}' ) {
        winston.log( 'info', 'calling createContents' );
        repo.createContents( file, message, content, branch, function( err, data, headers ) {
          if ( err ) {
            callback( err );
          }
          else {
            callback();
          }
        } );
      }
      else {
        winston.log( 'info', 'no commit attempted for ' + file + ' because there are no strings' );
        callback();
      }
    }

    // otherwise, update the file using its SHA
    else {
      winston.log( 'info', 'found file ' + file + ' in GitHub.  Attempting to update.' );

      const sha = data.sha;
      const buffer = Buffer.from( data.content, data.encoding );
      if ( buffer.toString() !== content ) {
        repo.updateContents( file, message, content, sha, branch, function( err, data, headers ) {
          if ( err ) {
            callback( err );
          }
          else {
            winston.log( 'info', 'commit: "' + message + '" committed successfully' );
            callback();
          }
        } );
      }
      else {
        winston.log( 'info', 'no commit attempted for ' + file + ' because the contents haven\'t changed' );
        callback();
      }
    }
  } );
}

/**
 * request the strings from Github
 * @param {string} Url
 * @param {array} strings
 * @param {string} projectName
 * @returns {Promise.<string>}
 */
async function getGhStrings( Url, strings, projectName, isEnglishStrings ) {
  winston.log( 'info', 'sending request to ' + Url );
  const response = await nodeFetch( Url );

  return response.text().then( body => {
    if ( response.status === 200 ) {
      strings[ projectName ] = JSON.parse( body );
      winston.log( 'info', 'request for ' + Url + ' returned successfully' );
    }
    else if ( response.status === 404 && !isEnglishStrings ) {
      strings[ projectName ] = {};
      //winston.log( 'info', 'no strings in GitHub for project = ' + projectName + ', locale = ' + targetLocale );
    }
    else if ( !isEnglishStrings ) {
      strings[ projectName ] = {};
      winston.log( 'info', 'request for ' + Url + 'failed, response code = ' + response.status );
    }
    else {
      winston.log( 'error', 'request for english strings for project ' + projectName + ' failed. Response code: ' +
                            response.status + '. URL: ' + Url + '. Error: ' + response.error );
    }
  } );
}

/**
 * Return an octonode github client using the credentials in config.json.
 * Use config.json.template as an example for creating a config.json file with your github credentials
 * @returns {*}
 */
function getGhClient() {
  const username = preferences.githubUsername;
  const pass = preferences.githubPassword;

  winston.log( 'info', 'getting GH client for user ' + username );

  return octonode.client( {
    username: username,
    password: pass
  } );
}

/**
 * get the URL for this sim, does not check if sim exists
 * @param simName
 */
function getPublishedEnglishSimURL( simName ) {
  return RosettaConstants.PRODUCTION_SERVER_URL + '/sims/html/' + simName + '/latest/' + simName + '_en.html';
}

/**
 * get the HTML of the latest published version of the sim from the sever
 * @param {string} simName
 * @returns {Promise.<string>} - html of the published simulation
 * @rejects {Error}
 */
async function getLatestSimHtml( simName ) {

  // compose the URL for the latest English version of the simulation
  const simUrl = getPublishedEnglishSimURL( simName );

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
  renderError: renderError,
  sendEmail: sendEmail,
  extractStrings: extractStrings,
  extractStringsAPI: extractStringsAPI,
  getGhClient: getGhClient,
  getGhStrings: getGhStrings,
  getPublishedEnglishSimURL: getPublishedEnglishSimURL,
  getSimInfo: getSimInfo,
  getLatestSimHtml: getLatestSimHtml,
  checkAndUpdateStringFile: checkAndUpdateStringFile,
  stringify: stringify
};
