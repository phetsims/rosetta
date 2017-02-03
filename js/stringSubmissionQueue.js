// Copyright 2015, University of Colorado Boulder

/**
 * 'stringSubmissionQueue' is an asynchronous (async.queue) queue with a concurrency of one (meaning that only one task
 * is executed at a time) that is used to serialize submissions of strings for a translation.
 *
 * @author Aaron Davis
 * @author John Blanco
 */
/* eslint-env node */
'use strict';

// modules
var async = require( 'async' );
var fs = require( 'fs' );
var query = require( 'pg-query' ); // eslint-disable-line
var querystring = require( 'querystring' );
var request = require( 'request' );
var winston = require( 'winston' );

var LocaleInfo = require( './LocaleInfo' );
var TranslationUtils = require( './TranslationUtils' );
var getGhClient = TranslationUtils.getGhClient;
var sendEmail = TranslationUtils.sendEmail;
var checkAndUpdateStringFile = TranslationUtils.checkAndUpdateStringFile;
var stringify = TranslationUtils.stringify;

var _ = require( 'underscore' ); // eslint-disable-line

// constants
var HTML_SIMS_DIRECTORY = global.preferences.htmlSimsDirectory;

module.exports.stringSubmissionQueue = async.queue( function( task, taskCallback ) {

  var req = task.req;
  var res = task.res;

  var targetLocale = req.param( 'targetLocale' );
  var simName = req.param( 'simName' );
  var ghClient = getGhClient();
  var babel = ghClient.repo( 'phetsims/babel' );

  var userId = ( req.session.userId ) ? req.session.userId : 0;

  /*
   * Repos will contain an object whose keys are repository names and whose values are of the same form
   * as the objects stored in babel. Multiple repositories can be committed to at the same time because
   * common code strings might be submitted as well.
   */
  var repos = {};

  // req.body contains all of the strings submitted in the POST request from the translation utility
  for ( var string in req.body ) {
    if ( req.body.hasOwnProperty( string ) ) {

      // data submitted is in the form "[repository] [key]", for example "area-builder area-builder.title"
      var repoAndKey = string.split( ' ' );
      var repo = repoAndKey[ 0 ];
      var key = repoAndKey[ 1 ];

      if ( !repos[ repo ] ) {
        repos[ repo ] = {};
      }

      var stringValue = req.body[ string ];

      // check if the string is already in translatedStrings to get the history if it exists
      var translatedString = req.session.translatedStrings[ targetLocale ] &&
                             req.session.translatedStrings[ targetLocale ][ repo ] &&
                             req.session.translatedStrings[ targetLocale ][ repo ][ key ];
      var history = translatedString && translatedString.history;
      var oldValue = ( history && history.length ) ? history[ history.length - 1 ].newValue : '';

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

      // don't add the string if the value hasn't changed
      if ( oldValue !== stringValue ) {
        var newHistoryEntry = {
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
        repos[ repo ][ key ] = {
          value: stringValue,
          history: history
        };
      }
      else if ( translatedString ) {
        repos[ repo ][ key ] = translatedString;
      }
    }
  }

  // keep track of strings that successfully committed and those that didn't
  var errors = [];
  var successes = [];
  var errorDetails = '';

  // after all commits are finished, render the response
  var finished = _.after( Object.keys( repos ).length, function() {

    var repositories = [];
    for ( var repo in repos ) {
      repositories.push( 'repository = \'' + repo + '\'' );
    }
    var repositoriesString = repositories.join( ' OR ' );

    var deleteQuery = 'DELETE FROM saved_translations WHERE user_id = $1 AND locale = $2 AND (' + repositoriesString + ')';
    winston.log( 'info', 'running SQL command: ' + deleteQuery );
    query( deleteQuery, [ userId, targetLocale ], function( err, rows ) {
      if ( err ) {
        winston.log( 'error', err );
      }
      else {
        winston.log( 'info', 'deleted saved strings for translation with user_id = ' + userId + ' locale = ' + targetLocale + ' ' + repositoriesString );
      }
    } );

    var locale = LocaleInfo.localeInfoObject[ targetLocale ];

    res.render( 'translation-submit.html', {
      title: 'Translation submitted',
      strings: successes,
      errorStrings: errors,
      error: ( errors.length > 0 ),
      stringsNotSubmitted: successes.length === 0 && errors.length === 0,
      errorDetails: errorDetails,
      timestamp: new Date().getTime(),
      simName: simName,
      targetLocale: targetLocale,
      direction: locale ? locale.direction : 'ltr'
    } );

    /*
     * Try to notify the build server that a new translation has been published. If this succeeds, the new translation
     * will appear on the website. This will fail when testing locally.
     */
    try {

      // get the directory names that correspond to version numbers
      var versions = fs.readdirSync( HTML_SIMS_DIRECTORY + simName );

      // filter out anything that doesn't look like a version identifier (example of valid version ID is 1.2.3)
      versions = versions.filter( function( dirName ){
        var dirNameTokenized = dirName.split( '.' );
        if ( dirNameTokenized.length !== 3 ){
          return false;
        }
        for ( var i = 0; i < 3; i++ ){
          if ( isNaN( dirNameTokenized[ i ] ) ){
            return false;
          }
        }
        return true;
      } );

      // sort the list of version identifiers from oldest to newest, necessary because default order is lexicographic
      versions.sort( function( a, b ) {
        var aTokenized = a.split( '.' );
        var bTokenized = b.split( '.' );
        var result = 0;
        for ( var i = 0; i < aTokenized.length; i++ ) {
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
      var version = versions[ versions.length - 1 ];
      winston.log( 'info', 'detecting latest version: ' + version );

      // get the dependencies and turn them into a string
      var dependencies = require( HTML_SIMS_DIRECTORY + simName + '/' + version + '/dependencies.json' );
      var queryString = querystring.stringify( {
        'repos': JSON.stringify( dependencies ),
        'simName': simName,
        'version': version,
        'locales': targetLocale,
        'serverName': global.preferences.productionServerName,
        'authorizationCode': global.preferences.buildServerAuthorizationCode,
        'userId': userId
      } );

      // compose the URL for the build request and send it off to the build server
      var url = global.preferences.productionServerURL + '/deploy-html-simulation?' + queryString;
      request( url, function( error, response, body ) {
        if ( !error && response.statusCode === 200 ) {
          winston.log( 'info', 'sending build server request to: ' + url );
        }
        else {
          winston.log( 'error', 'notifying build server: ' + error );
        }
        taskCallback();
      } );
    }
    catch( e ) {
      winston.log( 'error', 'notifying build server: ' + e );
      taskCallback();
    }
  } );

  // commit to every repository that has submitted strings
  for ( var repository in repos ) {
    if ( repos.hasOwnProperty( repository ) ) {
      var file = repository + '/' + repository + '-strings_' + targetLocale + '.json';

      (function( repository, file ) {
        var strings = repos[ repository ];
        var content = stringify( strings );

        // fix newlines that have been changed automatically by stringify
        content = content.replace( /\\\\n/g, '\\n' );

        if ( content.length ) {
          var commitMessage = Date.now() + ' automated commit from rosetta for file ' + file;

          var onCommitSuccess = function() {
            for ( var stringKey in repos[ repository ] ) {
              var stringValue = repos[ repository ][ stringKey ].value;
              var translatedString = req.session.translatedStrings[ targetLocale ] &&
                                     req.session.translatedStrings[ targetLocale ][ repository ] &&
                                     req.session.translatedStrings[ targetLocale ][ repository ][ stringKey ];
              if ( !translatedString || stringValue !== translatedString.value ) {
                successes.push( {
                  stringKey: stringKey,
                  stringValue: stringValue
                } );
              }
            }
            finished();
          };

          winston.log( 'info', 'attempting update for file = ' + file );
          checkAndUpdateStringFile( babel, file, content, commitMessage, global.preferences.babelBranch, function( err ) {

            // Github sometimes returns a 409 error and fails to commit, in this case we'll try again once
            if ( err ) {
              winston.log( 'error', err + '. Error committing to file ' + file + '. Trying again in 5 seconds...' );
              setTimeout( function() {
                checkAndUpdateStringFile( babel, file, content, commitMessage, global.preferences.babelBranch, function( err ) {
                  if ( err ) {
                    errorDetails += err + '. Error committing to file ' + file;
                    winston.log( 'error', err + '. Error committing to file ' + file );
                    for ( var stringKey in repos[ repository ] ) {
                      var stringValue = repos[ repository ][ stringKey ].value;
                      var translatedString = req.session.translatedStrings[ targetLocale ] &&
                                             req.session.translatedStrings[ targetLocale ][ repository ] &&
                                             req.session.translatedStrings[ targetLocale ][ repository ][ stringKey ];
                      if ( !translatedString || stringValue !== translatedString.value ) {
                        errors.push( {
                          stringKey: stringKey,
                          stringValue: stringValue
                        } );
                      }
                    }
                    finished();
                    sendEmail( 'PUSH FAILED', err + '\n\n' + errorDetails + '\n\n' + JSON.stringify( errors ) );
                  }
                  else {
                    onCommitSuccess();
                  }
                } );
              }, 5000 );
            }

            // commit succeeded
            else {
              onCommitSuccess();
            }

          } );
        }
        else {
          winston.log( 'info', 'no commit attempted for ' + file + ' because no changes were made.' );
          finished();
        }
      })( repository, file );
    }
  }
}, 1 );
