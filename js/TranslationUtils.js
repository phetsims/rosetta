// Copyright 2002-2015, University of Colorado Boulder

/**
 * This file holds various utilities useful for translation
 *
 * @author Aaron Davis
 */

var http = require( 'http' );
var winston = require( 'winston' );
var github = require( 'octonode' );

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

var extractStrings = function( result, data ) {
  var projects = {};
  var matches = data.match( /string!([\w\.\/]+)/g );

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

  for ( var project in projects ) {
    result.push( {
      projectName: project.replace( new RegExp( '_', 'g' ), '-' ).toLowerCase(),
      stringKeys: projects[ project ]
    } );
  }
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
  var url = req.param( 'simUrl' ) || 'www.colorado.edu/physics/phet/dev/html/arithmetic/1.0.0-dev.13/arithmetic_en.html';
  var localhost = ( url.indexOf( 'localhost' ) === 0 );

  var slashIndex = url.indexOf( '/' );
  var host = ( localhost ) ? 'localhost' : url.substring( 0, slashIndex );
  var path = url.substring( slashIndex );

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
      var result = [];
      extractStrings( result, data );

      if ( result.lenght > 0 ) {
        res.send( '<p>Error: No strings found at ' + host + path + '</p>' );
      }
      else {
        res.setHeader( 'Content-Type', 'application/json' );
        res.end( JSON.stringify( result, null, 3 ) );
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

// convenience for a nicer looking stringify 
function stringify( data ) {
  return JSON.stringify( data, null, 2 );
}

/**
 * generic callback for all github functions, useful to leave here for testing other github api functions
 * @param err
 * @param data
 * @param headers
 */
function githubCallback( err, data, headers ) {
  console.log( 'error: ' + err );
  console.log( 'data: ' + stringify( data ) );
  console.log( 'headers:' + headers );
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
      repo.createContents( file, message, content, branch, function( err, data, headers ) {
        if ( err ) {
          callback( err );
        }
        else {
          callback();
        }
      } );
    }

    // otherwise, update the file using it's sha
    else {
      var sha = data.sha;
      repo.updateContents( file, message, content, sha, branch, function( err, data, headers ) {
        if ( err ) {
          callback( err );
        }
        else {
          callback();
        }
      } );
    }
  } );
}

/**
 * Return an octonode github client using the credentials in config.json.
 * Use config.json.template as an example for creating a config.json file with your github credentials
 * @returns {*}
 */
function getGhClient() {
  var config = require( '../config.json' );
  var username = config.githubUsername;
  var pass = config.githubPassword;

  return github.client( {
    username: username,
    password: pass
  } );
}

/**
 * For testing use of the github API
 */
function githubTest() {
  var ghClient = getGhClient();
  var babel = ghClient.repo( 'phetsims/babel' );

  var commitMessage = 'commit message';
  var content = 'some content';
  var branch = 'tests';
  var file = 'test-file-new.txt';

  // one of these commits will fail most likely
  commit( babel, file, content + '1', commitMessage + '1', branch );
  commit( babel, file, content + '2', commitMessage + '2', branch );
}

// export github functions
module.exports.getGhClient = getGhClient;
module.exports.commit = commit;
module.exports.stringify = stringify;
