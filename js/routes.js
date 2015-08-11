// Copyright 2002-2015, University of Colorado Boulder

/**
 * ExpressJS-style routes for handling the various URLs for the translation utility.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

/* jslint node: true */
'use strict';

// modules
var https = require( 'https' );
var LocaleInfo = require( './LocaleInfo' );
var TranslatableSimInfo = require( './TranslatableSimInfo' );
var simInfoArray = require( '../data/simInfoArray.json' );
var TranslationUtils = require( './TranslationUtils' );
var winston = require( 'winston' );
var request = require( 'request' );
var async = require( 'async' );
var querystring = require( 'querystring' );
var fs = require( 'fs' );
var query = require( 'pg-query' );
var assert = require( 'assert' );
var email = require( 'emailjs/email' );
var contains = TranslationUtils.contains;
var getGhClient = TranslationUtils.getGhClient;
var commit = TranslationUtils.commit;
var stringify = TranslationUtils.stringify;

/* jshint -W079 */
var _ = require( 'underscore' );
/* jshint +W079 */

// constants
var HTML_SIMS_DIRECTORY = '/data/web/htdocs/phetsims/sims/html/';
var BRANCH = 'tests'; // branch of babel to commit to, should be changed to master when testing is finished
var PREFERENCES_FILE = process.env.HOME + '/.phet/build-local.json';

assert( fs.existsSync( PREFERENCES_FILE ), 'missing preferences file ' + PREFERENCES_FILE );
var preferences = require( PREFERENCES_FILE );

assert( preferences.githubUsername, 'githubUsername is missing from ' + PREFERENCES_FILE );
assert( preferences.githubPassword, 'githubPassword is missing from ' + PREFERENCES_FILE );

// configure email server if credentials are present
var server;
if ( preferences.emailUsername && preferences.emailPassword && preferences.emailServer && preferences.emailFrom && preferences.emailTo ) {
  server = email.server.connect( {
    user: preferences.emailUsername,
    password: preferences.emailPassword,
    host: preferences.emailServer,
    tls: preferences.tls || true
  } );
}

// configure postgres connection
if ( preferences.pgConnectionString ) {
  query.connectionParameters = preferences.pgConnectionString;
}
else {
  query.connectionParameters = 'postgresql://localhost/rosetta';
}

/**
 * Send an email if server is defined. Used to notify developers push to babel fails
 * @param subject
 * @param text
 */
function sendEmail( subject, text ) {
  if ( server ) {
    server.send( {
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
}

var translatedStrings = {}; // object to hold the already translated strings

// utility function for sending the user to the login page
function sendUserToLoginPage( res, host, destinationUrl ) {
  res.render( 'login-required.html', {
    title: 'Login Required',
    host: host,
    destinationUrl: destinationUrl
  } );
}

// utility function for presenting escaped HTML, also escapes newline character
function escapeHTML( s ) {
  return s.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /\n/g, '&#92;n' );
}

/**
 * Route that checks whether the user has a valid session in progress.  This works by looking for the cookie set when
 * the user logs in to the main web site and, if said cookie is present, uses it to obtain user information from the
 * 'main' web site.
 *
 * TODO: As of mid-Feb 2015, this checks the session on every page serve.  It would probably be better to do some local
 * management of sessions, and only re-check them periodically.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.checkForValidSession = function( req, res, next ) {

  if ( req.get( 'host' ).indexOf( 'localhost' ) === 0 ) {
    // bypass credential evaluation to allow testing on localhost
    winston.log( 'warn', 'Bypassing session validation to allow testing on localhost' );
    next(); // send to next route
    return;
  }

  // check whether the session cookie exists
  winston.log( 'info', 'Checking for login cookie' );
  var cookie = req.cookies.JSESSIONID;
  if ( cookie === undefined ) {
    // no session cookie present, the user must log in
    winston.log( 'info', 'session cookie not found, sending to login page' );
    winston.log( 'info', 'host = ' + req.get( 'host' ) );
    winston.log( 'info', 'req.url = ' + req.url );
    sendUserToLoginPage( res, req.get( 'host' ), req.url );
  }
  // if the session already has trustedTranslator defined, and it is true, then the user must be a trusted
  // translator who has already logged in
  else if ( req.session.trustedTranslator || req.session.teamMember ) {
    next();
  }
  else {
    // session cookie was present, attempt to obtain session information
    var options = {
      host: req.get( 'host' ),
      path: '/services/check-login',
      method: 'GET',
      headers: {
        'Cookie': 'JSESSIONID=' + cookie
      }
    };

    var sessionDataRequestCallback = function( response ) {
      var data = '';

      // another chunk of data has been received, so append it
      response.on( 'data', function( chunk ) {
        data += chunk;
      } );

      // the whole response has been received - see if the credentials are valid
      response.on( 'end', function() {
        winston.log( 'info', 'data received: ' + data );
        var userData = JSON.parse( data );
        if ( userData.loggedIn ) {
          winston.log( 'info', 'credentials obtained, user is logged in, moving to next step' );

          if ( !userData.trustedTranslator && !userData.teamMember ) {
            res.render( 'error.html', {
              title: 'Translation Utility Error',
              message: 'You must be a trusted translator to use the PhET translation utility. Email phethelp@colorado.edu for more information.',
              errorDetails: '',
              timestamp: new Date().getTime()
            } );
          }
          else {
            req.session.teamMember = userData.teamMember;
            req.session.trustedTranslator = userData.trustedTranslator;
            req.session.userId = userData.userId;
            req.session.username = userData.username;
            next(); // send to next route
          }
        }
        else {
          // user is not logged in, send them to the login page
          sendUserToLoginPage( res, req.get( 'host' ), req.url );
        }
      } );
    };

    var requestCredentials = https.request( options, sessionDataRequestCallback );

    // error handling
    requestCredentials.on( 'error', function( err ) {
      winston.log( 'error', 'error retrieving session data: ' + err );
      res.render( 'error.html', {
        title: 'Translation Utility Error',
        message: 'Unable to obtain user credentials',
        errorDetails: err,
        timestamp: new Date().getTime()
      } );
    } );

    // send the request
    requestCredentials.end();
  }
};

/**
 * Route that lets the user choose a simulation and language to translate, and subsequently routes them to the actual
 * translation page.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.chooseSimulationAndLanguage = function( req, res ) {

  // Pull the username from the cookie
  var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'not logged in';

  res.render( 'translate-home.html', {
    title: 'PhET Translation Utility',
    simInfoArray: simInfoArray,
    localeInfoArray: LocaleInfo.sortedLocaleInfoArray(),
    username: username
  } );
};

/**
 * Route that creates a page for translating a given simulation to a given language.  The simulation ID and the target
 * language are extracted from the incoming request.
 *
 * @param req
 * @param res
 */
module.exports.translateSimulation = function( req, res ) {
  var simName = req.param( 'simName' );
  var targetLocale = req.param( 'targetLocale' );
  var rawGithub = 'https://raw.githubusercontent.com';
  var activeSimsPath = '/phetsims/chipper/master/data/active-sims';
  var userId = ( req.session.userId ) ? req.session.userId : 0; // use an id of 0 for localhost testing

  winston.log( 'info', 'loading page for ' + simName + ' ' + targetLocale );

  // get the url of the live sim (from simInfoArray)
  var simUrl;
  for ( var i = 0; i < simInfoArray.length; i++ ) {
    if ( simInfoArray[ i ].projectName === simName ) {
      simUrl = simInfoArray[ i ].testUrl;
      break;
    }
  }

  winston.log( 'info', 'getting strings from ' + simUrl );

  // extract strings from the live sim's html file
  request( simUrl, function( error, response, body ) {
    if ( !error && response.statusCode === 200 ) {
      var i;
      var sims; // array of all active sims

      // initialize the sims array from the active-sims file in chipper
      request( rawGithub + activeSimsPath, function( error, response, body ) {
        if ( !error && response.statusCode === 200 ) {
          sims = body.toString().split( '\n' );
        }
        else {
          winston.log( 'error', error );
        }
        finished();
      } );

      // extract strings from the sim's html file and store them in the extractedStrings array
      // extractedStrings in an array of objects of the form { projectName: 'color-vision', stringKeys: [ 'key1', 'key2', ... ] }
      var extractedStrings = [];
      TranslationUtils.extractStrings( extractedStrings, body );
      var englishStrings = {}; // object to hold the English strings

      /*
       * finished() must be called extractedStrings.length * 2 + 1 times. This is the number of http requests to github that
       * need to return before we are ready to render the page. We make two requests per repo - one for the English strings from the sims's
       * repo, and one for the translated strings from babel - plus one more for the request to get the active sims list from chipper.
       */
      var finished = _.after( extractedStrings.length * 2 + 1, function() {
        winston.log( 'info', 'finished called in translateSimulation' );

        var simStringsArray = [];
        var commonStringsArray = [];

        var repositories = '';
        var savedStrings = {};
        for ( i = 0; i < extractedStrings.length; i++ ) {
          if ( i > 0 ) {
            repositories += ' OR ';
          }
          repositories += 'repository = \'' + extractedStrings[ i ].projectName + '\'';

          // Initialize saved strings for every repo to an empty object.
          // These objects will store string key/value pairs for each repo.
          savedStrings[ extractedStrings[ i ].projectName ] = {};
        }
        var savedStringsQuery = 'SELECT * from saved_translations where user_id = $1 AND locale = $2 AND (' + repositories + ')';
        winston.log( 'info', 'running query: ' + savedStringsQuery );

        // query postgres to see if there are any saved strings for this user
        query( savedStringsQuery, [ userId, targetLocale ], function( err, rows ) {
          winston.log( 'info', 'query returned' );
          if ( err ) {
            winston.log( 'error', err );
          }

          // load saved strings from database to saveStrings object if there are any
          if ( rows && rows.length > 0 ) {
            winston.log( 'info', 'using ' + rows.length + ' saved strings' );
            for ( i = 0; i < rows.length; i++ ) {
              var row = rows[ i ];
              savedStrings[ row.repository ][ row.stringkey ] = row.stringvalue;
            }
          }

          // iterate over all projects that this sim takes strings from
          for ( i = 0; i < extractedStrings.length; i++ ) {
            var project = extractedStrings[ i ];
            var strings = englishStrings[ project.projectName ];

            // put the strings under common strings or sim strings depending on which project they are from
            var array = ( contains( sims, project.projectName ) ) ? simStringsArray : commonStringsArray;
            for ( var j = 0; j < project.stringKeys.length; j++ ) {
              var key = project.stringKeys[ j ];

              // data needed to render to the string on the page - the key, the current value, the English value, and the repo
              var stringRenderInfo = {
                key: key,
                englishValue: ( strings.hasOwnProperty( key ) ) ? escapeHTML( strings[ key ].value ) : key,
                repo: project.projectName
              };

              // used saved string if it exists
              if ( savedStrings[ project.projectName ][ key ] ) {
                winston.log( 'info', 'using saved string ' + key + ': ' + savedStrings[ project.projectName ][ key ] );
                stringRenderInfo.value = escapeHTML( savedStrings[ project.projectName ][ key ] );
              }
              else {
                stringRenderInfo.value = translatedStrings[ project.projectName ][ key ] ? escapeHTML( translatedStrings[ project.projectName ][ key ].value ) : '';
              }

              array.push( stringRenderInfo );
            }
          }

          // Pull the username from the cookie
          var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'not logged in';

          var locale = LocaleInfo.localeInfoArray()[ targetLocale ];

          // Assemble the data that will be supplied to the template.
          var templateData = {
            title: "PhET Translation Utility",
            subtitle: "Please enter a translation for each English string:",
            destinationLanguage: locale ? locale.name : 'Non existent locale',
            simStringsArray: simStringsArray,
            commonStringsArray: commonStringsArray,
            simName: simName,
            localeName: targetLocale,
            direction: locale ? locale.direction : 'ltr',
            simUrl: TranslatableSimInfo.getSimInfoByProjectName( simName ).testUrl,
            username: username,
            trustedTranslator: ( req.session.trustedTranslator ) ? req.session.trustedTranslator : false
          };

          // Render the page.
          res.render( 'translate-sim.html', templateData );
        } );
      } );

      // send requests to github for the common code English strings
      for ( i = 0; i < extractedStrings.length; i++ ) {
        (function( i ) {
          var projectName = extractedStrings[ i ].projectName;
          var stringsFilePath = rawGithub + '/phetsims/' + projectName + '/master/' + projectName + '-strings_en.json';
          var translatedStringsPath = rawGithub + '/phetsims/babel/' + BRANCH + '/' + projectName + '/' + projectName + '-strings_' + targetLocale + '.json';

          request( stringsFilePath, function( error, response, body ) {
            if ( !error && response.statusCode === 200 ) {
              englishStrings[ projectName ] = JSON.parse( body );
            }
            else {
              winston.log( 'error', 'request for english strings for project ' + projectName + ' failed. Response code: ' +
                                    response.statusCode + '. URL: ' + stringsFilePath + '. Error: ' + error );
            }
            finished();
          } );

          request( translatedStringsPath, function( error, response, body ) {
            if ( !error && response.statusCode === 200 ) {
              translatedStrings[ projectName ] = JSON.parse( body );
            }
            else {
              winston.log( 'error', 'request for translated strings for project ' + projectName + ' failed. Response code: ' +
                                    response.statusCode + '. URL: ' + translatedStringsPath + '. Error: ' + error );
              translatedStrings[ projectName ] = {}; // add an empty object with the project name key so key lookups don't fail later on
            }
            finished();
          } );
        })( i );
      }
    }
    else {
      winston.log( 'error', error );
      res.send( 'Error: Sim data not found' );
    }
  } );
};

/*
 * Code for submitting to github. Uses a queue to ensure only one batch of strings is submitted at 
 * the same time.
 */
var taskQueue = async.queue( function( task, taskCallback ) {
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
        'serverName': 'simian'
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
      var strings = repos[ repository ];
      var content = stringify( strings );

      // fix newlines that have been changed automatically by stringify
      content = content.replace( /\\\\n/g, '\\n' );

      var file = repository + '/' + repository + '-strings_' + targetLocale + '.json';

      if ( content.length && content !== stringify( translatedStrings[ repository ] ) ) {
        var commitMessage = Date.now() + ' automated commit from rosetta for file ' + file;

        (function( file, commitMessage, repository, content ) {
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
        })( file, commitMessage, repository, content );
      }
      else {
        winston.log( 'info', 'no commit attempted for ' + file + ' because no changes were made.' );
        finished();
      }
    }
  }
}, 1 );

module.exports.submitStrings = function( req, res ) {
  var simName = req.param( 'simName' );
  var targetLocale = req.param( 'targetLocale' );

  winston.log( 'info', 'queuing string submission for ' + simName + '_' + targetLocale );
  taskQueue.push( {
    req: req,
    res: res
  }, function() {
    winston.log( 'info', 'finished string submission for ' + simName + '_' + targetLocale );
  } );
};

module.exports.saveStrings = function( req, res ) {
  var simName = req.param( 'simName' );
  var targetLocale = req.param( 'targetLocale' );
  var userId = ( req.session.userId ) ? req.session.userId : 0;

  var error = false;

  var finished = _.after( Object.keys( req.body ).length, function() {
    winston.log( 'info', 'finished string saving for ' + simName + '_' + targetLocale );
    res.json( {
      'success': !error
    } );
  } );

  var repos = {};
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
      var ts = new Date();

      (function( key, stringValue ) {
        if ( key && stringValue && stringValue.length > 0 ) {
          query( 'SELECT upsert_saved_translations' +
                 '($1::bigint, $2::varchar(255), $3::varchar(255), $4::varchar(8), $5::varchar(255), $6::timestamp)', [ userId, key, repo, targetLocale, stringValue, ts ],
            function( err, rows, result ) {
              if ( err ) {
                winston.log( 'error', 'inserting row: (' + userId + ', ' + key + ', ' + stringValue + ', ' + targetLocale + ')' );
                winston.log( 'error', err );
                error = true;
              }
              finished();
            } );
        }
        else {
          finished();
        }
      })( key, stringValue );
    }
    else {
      finished();
    }
  }
};

/**
 * Default route for when a page is not found in the translation utility.
 *
 * @param req
 * @param res
 */
module.exports.pageNotFound = function( req, res ) {
  res.send( '<p>Error: Page not found.  URL = ' + req.url + '</p>' );
};

/**
 * Route for extracting strings from a build sim, see TranslationUtils.extractStrings.
 */
module.exports.extractStringsAPI = TranslationUtils.extractStringsAPI;