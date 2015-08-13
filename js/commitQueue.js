// Copyright 2002-2015, University of Colorado Boulder

/**
 * commitQueue is an async.queue with a max length of one. It ensures that only one translation can be
 * committing to github concurrently.
 *
 * The queue is responsible for executing the task of committing to github the submitted translation.
 *
 * @author Aaron Davis
 */

/* jslint node: true */
'use strict';

// modules
var async = require( 'async' );
var fs = require( 'fs' );
var query = require( 'pg-query' );
var querystring = require( 'querystring' );
var request = require( 'request' );
var winston = require( 'winston' );

var constants = require( './constants' );
var LocaleInfo = require( './LocaleInfo' );
var TranslationUtils = require( './TranslationUtils' );
var getGhClient = TranslationUtils.getGhClient;
var sendEmail = TranslationUtils.sendEmail;
var commit = TranslationUtils.commit;
var stringify = TranslationUtils.stringify;

/* jshint -W079 */
var _ = require( 'underscore' );
/* jshint +W079 */

// constants
var HTML_SIMS_DIRECTORY = '/data/web/htdocs/phetsims/sims/html/';
var BRANCH = constants.BRANCH;
var GITHUB_URL_BASE = constants.GITHUB_URL_BASE;

// globals
var translatedStrings = global.translatedStrings;

module.exports.commitQueue = async.queue( function( task, taskCallback ) {
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

      // data submitted is in the form "[repository] [key]", for example "area-builder area-builder.name"
      var repoAndKey = string.split( ' ' );
      var repo = repoAndKey[ 0 ];
      var key = repoAndKey[ 1 ];

      if ( !repos[ repo ] ) {
        repos[ repo ] = {};
      }

      var stringValue = req.body[ string ];

      // check if the string is already in translatedStrings to get the history if it exists
      var translatedString = ( translatedStrings[ repo ] ) ? translatedStrings[ repo ][ key ] : null;
      var history = ( translatedString ) ? translatedString.history : null;
      var oldValue = ( history && history.length ) ? history[ history.length - 1 ].newValue : '';

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

    var getLocalizedSimsQuery = 'SELECT localized_simulation.id, phet_user.id from localized_simulation, simulation, project, phet_user ' +
                                'WHERE simulation.name = \'' + simName + '\' AND locale = \'' + targetLocale + '\' AND phet_user.id = ' + userId + ' AND ' +
                                'simulation = simulation.id AND simulation.project = project.id AND project.type = 2';
    var addTranslatorQuery = 'INSERT INTO user_localized_simulation_mapping ' + getLocalizedSimsQuery;
    winston.log( 'info', 'running SQL command: ' + addTranslatorQuery );
    query( addTranslatorQuery, function( err, rows ) {
      if ( err ) {
        winston.log( 'error', err );
      }
      else {
        winston.log( 'info', 'added translator to user_localized_simulation_mapping with user_id = ' + userId + ' locale = ' + targetLocale + ' simName = ' + simName );
      }
    } );

    var locale = LocaleInfo.localeInfoArray()[ targetLocale ];

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
     * Try to notify the build server that a new translation has been published. If this succeeds, the
     * new translation will appear on the website. This will fail when testing locally.
     */
    try {
      var versions = fs.readdirSync( HTML_SIMS_DIRECTORY + simName ).sort();
      var version = versions[ versions.length - 1 ]; // most recent version
      winston.log( 'info', 'detecting latest version: ' + version );
      var dependencies = require( HTML_SIMS_DIRECTORY + simName + '/' + version + '/dependencies.json' );

      var queryString = querystring.stringify( {
        'repos': JSON.stringify( dependencies ),
        'simName': simName,
        'version': version,
        'locales': JSON.stringify( [ targetLocale ] ),
        'serverName': 'simian.colorado.edu',
        'authorizationCode': global.preferences.buildServerAuthorizationCode
      } );

      var url = 'http://phet-dev.colorado.edu/deploy-html-simulation?' + queryString;

      request( url, function( error, response, body ) {
        if ( !error && response.statusCode === 200 ) {
          winston.log( 'info', 'sending build server request to: ' + url );
        }
        else {
          winston.log( 'info', 'error: deploy failed' );
        }
        taskCallback();
      } );
    }
    catch( e ) {
      winston.log( 'error', 'error notifying build server ' + e );
      taskCallback();
    }
  } );

  // commit to every repository that has submitted strings
  for ( var repository in repos ) {
    if ( repos.hasOwnProperty( repository ) ) {
      var translatedStringsPath = GITHUB_URL_BASE + '/phetsims/babel/' + BRANCH + '/' + repository + '/' + repository + '-strings_' + targetLocale + '.json';
      var file = repository + '/' + repository + '-strings_' + targetLocale + '.json';

      (function( repository, file, translatedStringsPath ) {
        winston.log( 'info', 'sending request to ' + translatedStringsPath );
        request( translatedStringsPath, function( error, response, body ) {
          var strings = repos[ repository ];
          var githubStrings; // strings currently in babel (if the file exists)

          if ( !error && response.statusCode === 200 ) {
            githubStrings = JSON.parse( body );
          }
          else {
            if ( error ) {
              winston.log( 'error', 'request to ' + translatedStringsPath + ' failed with error ' + error );
            }
            else if ( response ) {
              winston.log( 'error', 'request to ' + translatedStringsPath + ' failed with status ' + response.statusCode );
            }
          }

          winston.log( 'info', githubStrings );

          var newStrings = true;
          var content;
          if ( githubStrings ) {
            strings = _.extend( githubStrings, strings );
            content = stringify( strings );
            newStrings = ( content !== stringify( githubStrings ) );
          }
          else {
            content = stringify( strings );
          }

          // fix newlines that have been changed automatically by stringify
          content = content.replace( /\\\\n/g, '\\n' );

          if ( content.length && newStrings ) {
            var commitMessage = Date.now() + ' automated commit from rosetta for file ' + file;

            var onCommitSuccess = function() {
              winston.log( 'info', 'commit: "' + commitMessage + '" committed successfully' );
              for ( var stringKey in repos[ repository ] ) {
                stringValue = repos[ repository ][ stringKey ].value;
                if ( !translatedStrings[ repository ] || !translatedStrings[ repository ][ stringKey ] || stringValue !== translatedStrings[ repository ][ stringKey ].value ) {
                  successes.push( {
                    stringKey: stringKey,
                    stringValue: stringValue
                  } );
                }
              }
              finished();
            };

            commit( babel, file, content, commitMessage, BRANCH, function( err ) {
              // commit failed
              // Github sometimes returns a 409 error and fails to commit, in this case we'll try again once
              if ( err ) {
                winston.log( 'error', err + '. Error committing to file ' + file + '. Trying again in 5 seconds...' );
                setTimeout( function() {
                  commit( babel, file, content, commitMessage, BRANCH, function( err ) {
                    if ( err ) {
                      errorDetails += err + '. Error committing to file ' + file + '<br>';
                      winston.log( 'error', err + '. Error committing to file ' + file );
                      for ( var stringKey in repos[ repository ] ) {
                        stringValue = repos[ repository ][ stringKey ].value;
                        if ( !translatedStrings[ repository ] || !translatedStrings[ repository ][ stringKey ] || stringValue !== translatedStrings[ repository ][ stringKey ].value ) {
                          errors.push( {
                            stringKey: stringKey,
                            stringValue: stringValue
                          } );
                        }
                      }
                      finished();
                      sendEmail( 'PUSH FAILED', err + '\n\n' + errorDetails + '\n\n' + errors );
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
        } );
      })( repository, file, translatedStringsPath );
    }
  }
}, 1 );
