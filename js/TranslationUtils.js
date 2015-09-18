// Copyright 2002-2015, University of Colorado Boulder

/**
 * This file holds various utilities useful for translation
 *
 * @author Aaron Davis
 */

/* jslint node: true */
'use strict';

var http = require( 'http' );
var winston = require( 'winston' );
var github = require( 'octonode' );
var email = require( 'emailjs/email' );

// globals
var preferences = global.preferences;


/*---------------------------------------------------------------------------*
 * Email utilities
 *---------------------------------------------------------------------------*/

// configure email server if credentials are present
var emailServer;
if ( preferences.emailUsername && preferences.emailPassword && preferences.emailServer && preferences.emailFrom && preferences.emailTo ) {
  emailServer = email.server.connect( {
    user: preferences.emailUsername,
    password: preferences.emailPassword,
    host: preferences.emailServer,
    tls: preferences.tls || true
  } );
}

/**
 * Send an email if server is defined. Used to notify developers push to babel fails
 * @param subject
 * @param text
 */
module.exports.sendEmail = function( subject, text ) {
  if ( emailServer ) {
    emailServer.send( {
      text: text,
      from: 'Rosetta <' + preferences.emailFrom + '>',
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
};


/*---------------------------------------------------------------------------*
 * Utility functions
 *---------------------------------------------------------------------------*/

// utility function for presenting escaped HTML, also escapes newline character
var escapeHTML = function( s ) {
  return s.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /\n/g, '&#92;n' );
};
module.exports.escapeHTML = escapeHTML;

// convenience method to check if an item is in an array
var contains = function( array, item ) {
  for ( var i = 0; i < array.length; i++ ) {
    if ( array[ i ] === item ) {
      return true;
    }
  }
  return false;
};
module.exports.contains = contains;

var extractStrings = function( data, simName ) {
  var projects = {};
  var matches = data.match( /string!([\w\.\/-]+)/g );
  var simShaInfo = new RegExp( '"' + simName + '": {\\s*"sha": "(\\w*)",\\s*"branch": "(\\w*)"', 'g' ).exec( data );
  var sha = ( simShaInfo.length > 1 ) ? simShaInfo[ 1 ] : 'master'; // default to master if no sha is found

  // if no matches are found, it probably means the sim url was not correct
  if ( matches === null ) {
    return;
  }

  for ( var i = 0; i < matches.length; i++ ) {
    var projectAndString = matches[ i ].substring( 7 ).split( '/' );
    var projectName = projectAndString[ 0 ];
    var string = projectAndString[ 1 ];

    projects[ projectName ] = projects[ projectName ] || [];

    if ( !contains( projects[ projectName ], string ) ) {
      projects[ projectName ].push( string );
    }
  }

  var result = { extractedStrings: [], sha: sha };
  for ( var project in projects ) {
    result.extractedStrings.push( {
      projectName: project.replace( new RegExp( '_', 'g' ), '-' ).toLowerCase(),
      stringKeys: projects[ project ]
    } );
  }

  return result;
};
module.exports.extractStrings = extractStrings;

/**
 * Route that extracts strings from a built sim. Expects query parameter 'simUrl', the url of the built sim to
 * extract the strings from. Requests are made via http. Do not include to protocol in the simUrl parameter.
 *
 * Example simUrl values:
 * - www.colorado.edu/physics/phet/dev/html/arithmetic/1.0.0-dev.13/arithmetic_en.html
 * - localhost:8000/color-vision/build/color-vision_en.html
 * - phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html
 *
 * @param req
 * @param res
 */
module.exports.extractStringsAPI = function( req, res ) {
  // included for an easy default test
  var url = req.param( 'simUrl' ) || 'phet-dev.colorado.edu/sims/html/molecules-and-light/latest/molecules-and-light_en.html';
  var localhost = ( url.indexOf( 'localhost' ) === 0 );

  var slashIndex = url.indexOf( '/' );
  var host = ( localhost ) ? 'localhost' : url.substring( 0, slashIndex );
  var path = url.substring( slashIndex );

  var urlSplit = url.split( '/' );
  var simName = urlSplit[ urlSplit.length - 1 ].split( '_' )[ 0 ];

  var options = {
    host: host,
    path: path,
    method: 'GET'
  };

  // if running locally get the port number if it is part of the url
  if ( localhost ) {
    var colonIndex = url.indexOf( ':' );
    if ( colonIndex > -1 ) {
      options.port = url.substring( colonIndex + 1, slashIndex );
    }
  }

  winston.log( 'info', 'requesting sim at host: ' + options.host + ', port: ' + options.port + ', and path: ' + options.path );

  var sessionDataRequestCallback = function( response ) {
    var data = '';

    // another chunk of data has been received, so append it
    response.on( 'data', function( chunk ) {
      data += chunk;
    } );

    // the whole response has been received
    response.on( 'end', function() {
      var result = extractStrings( data, simName );

      if ( !result.extractedStrings.length ) {
        res.send( '<p>Error: No strings found at ' + host + path + '</p>' );
      }
      else {
        res.setHeader( 'Content-Type', 'application/json' );
        res.end( JSON.stringify( result, null, 2 ) );
      }
    } );
  };

  var strings = http.request( options, sessionDataRequestCallback );

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
};


/*---------------------------------------------------------------------------*
 * Github API functions
 *---------------------------------------------------------------------------*/

// convenience for a nicer looking stringify, also ensures a sorted JSON string
function stringify( data ) {
  var keys = [];
  var key;
  if ( data ) {
    for ( key in data ) {
      keys.push( key );
    }
  }
  keys.sort();
  var sortedData = {};
  for ( var index in keys ) {
    key = keys[ index ];
    sortedData[ key ] = data[ key ];
  }
  return JSON.stringify( sortedData, null, 2 );
}

/**
 * Commit a new file or a change to an existing file on github.
 *
 * @param {Object} repo - return value from ghClient.repo()
 * @param {string} file - file to be added or modified (must include the full path from the repo root)
 * @param {string} content - file contents
 * @param {string} message - commit message
 * @param {string} branch - branch of babel, will usually be 'master', but sometimes 'tests'
 * @param {function} callback
 */
function commit( repo, file, content, message, branch, callback ) {

  if ( !branch ) {
    branch = 'master';
  }

  // get the current contents of the file from github
  repo.contents( file, branch, function( err, data, headers ) {

    // if the file is not found, create a new file instead of updating an existing one
    if ( err ) {
      winston.log( 'info', 'no file found: ' + file + '. Attempting to create.' );

      if ( content !== '{}' ) {
        winston.log( 'info', 'calling createContets' );
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

    // otherwise, update the file using it's sha
    else {
      var sha = data.sha;
      var buffer = new Buffer( data.content, data.encoding );
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
 * Return an octonode github client using the credentials in config.json.
 * Use config.json.template as an example for creating a config.json file with your github credentials
 * @returns {*}
 */
function getGhClient() {
  var username = preferences.githubUsername;
  var pass = preferences.githubPassword;

  return github.client( {
    username: username,
    password: pass
  } );
}

// export github functions
module.exports.getGhClient = getGhClient;
module.exports.commit = commit;
module.exports.stringify = stringify;
