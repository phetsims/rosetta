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
var contains = TranslationUtils.contains;
var getGhClient = TranslationUtils.getGhClient;
var commit = TranslationUtils.commit;
var stringify = TranslationUtils.stringify;

/* jshint -W079 */
var _ = require( 'underscore' );
/* jshint +W079 */

var translatedStrings = {}; // object to hold the already translated strings

var BRANCH = 'tests'; // branch of babel to commit to, should be changed to master when testing is finished

// utility function for sending the user to the login page
function sendUserToLoginPage( res, host, destinationUrl ) {
  res.render( 'login-required.html', { title: 'Login Required', host: host, destinationUrl: destinationUrl } );
}

// utility function for presenting escaped HTML
function escapeHTML( s ) {
  return s.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' );
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

          if ( !userData.trustedTranslator ) {
            res.render( 'error.html', {
                title: 'Translation Utility Error',
                message: 'You must be a trusted translator to use the PhET translation utility. Email phethelp@colorado.edu for more information.',
                errorDetails: '',
                timestamp: new Date().getTime()
              }
            );
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
        }
      );
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

  // get the url of the live sim (from simInfoArray)
  var simUrl;
  for ( var i = 0; i < simInfoArray.length; i++ ) {
    if ( simInfoArray[ i ].projectName === simName ) {
      simUrl = simInfoArray[ i ].testUrl;
      break;
    }
  }

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

      var numberOfReposWithRequiredStrings = extractedStrings.length;

      /*
       * finished() must be called numberOfReposWithRequiredStrings * 2 + 1 times. This is the number of http requests to github that
       * need to return before we are ready to render the page. We make two requests per repo - one for the English strings from the sims's
       * repo, and one for the translated strings from babel - plus one more for the request to get the active sims list from chipper.
       */
      var finished = _.after( numberOfReposWithRequiredStrings * 2 + 1, function() {
        var simStringsArray = [];
        var commonStringsArray = [];

        // iterate over all projects that this sim takes strings from
        for ( i = 0; i < extractedStrings.length; i++ ) {
          var project = extractedStrings[ i ];
          var strings = englishStrings[ project.projectName ];

          // put the strings under common strings or sim strings depending on which project they are from
          var array = ( contains( sims, project.projectName ) ) ? simStringsArray : commonStringsArray;
          for ( var j = 0; j < project.stringKeys.length; j++ ) {
            var key = project.stringKeys[ j ];
            if ( strings.hasOwnProperty( key ) ) {
              array.push( {
                key: key,
                string: escapeHTML( strings[ key ].value ),
                value: translatedStrings[ project.projectName ][ key ] ? escapeHTML( translatedStrings[ project.projectName ][ key ].value ) : '',
                repo: project.projectName
              } );
            }
            // if an english string isn't found for a key, use the key name instead
            else {
              array.push( {
                key: key,
                string: key,
                value: translatedStrings[ project.projectName ][ key ] ? escapeHTML( translatedStrings[ project.projectName ][ key ].value ) : '',
                repo: project.projectName
              } );
            }
          }
        }

        // Pull the username from the cookie
        var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'not logged in';

        // Assemble the data that will be supplied to the template.
        var templateData = {
          title: "PhET Translation Utility",
          subtitle: "Please enter a translation for each English string:",
          destinationLanguage: LocaleInfo.localeToLanguageString( targetLocale ),
          simStringsArray: simStringsArray,
          commonStringsArray: commonStringsArray,
          simName: simName,
          simUrl: TranslatableSimInfo.getSimInfoByProjectName( simName ).testUrl,
          username: username,
          trustedTranslator: ( req.session.trustedTranslator ) ? req.session.trustedTranslator : false
        };

        // Render the page.
        res.render( 'translate-sim.html', templateData );
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
  var ghClient = getGhClient();
  var babel = ghClient.repo( 'phetsims/babel' );

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
      if ( stringValue !== '' && oldValue !== stringValue ) {
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
        repos[ repo ][ key ] = { value: stringValue, history: history };
      }
      else if ( translatedString ) {
        repos[ repo ][ key ] = translatedString;
      }
    }
  }

  // commit to every repository that has submitted strings
  for ( var repository in repos ) {
    if ( repos.hasOwnProperty( repository ) ) {
      var strings = repos[ repository ];
      var content = stringify( strings );
      var file = repository + '/' + repository + '-strings_' + targetLocale + '.json';

      if ( content.length && content !== stringify( translatedStrings[ repository ] ) ) {
        var commitMessage = Date.now() + ' automated commit from rosetta for file ' + file;

        (function( file, commitMessage ) {
          commit( babel, file, content, commitMessage, BRANCH, function( err ) {
            if ( err ) {
              winston.log( 'error', err + '. Error committing to file ' + file +
                                    '. This probably means that the file hash does not match the file' );
            }
            else {
              winston.log( 'info', 'commit: "' + commitMessage + '" committed successfully' );
            }
          } );
        })( file, commitMessage );
      }
      else {
        winston.log( 'info', 'no commit attempted for ' + file + ' because no changes were made.' );
      }
    }
  }

  res.send( 'Strings submitted' );
}, 1 );

module.exports.submitStrings = function( req, res ) {
  winston.log( 'info', 'queuing task' );
  taskQueue.push( { req: req, res: res }, function() {
    winston.log( 'info', 'build finished' );
  } );
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
