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
var query = require( 'pg-query' );
var request = require( 'request' );
var winston = require( 'winston' );
var fs = require( 'fs' );

var LocaleInfo = require( './LocaleInfo' );
var TranslatableSimInfo = require( './TranslatableSimInfo' );
var commitQueue = require( './commitQueue' ).commitQueue;
var TranslationUtils = require( './TranslationUtils' );
var constants = require( './constants' );
var contains = TranslationUtils.contains;
var escapeHTML = TranslationUtils.escapeHTML;

/* jshint -W079 */
var _ = require( 'underscore' );
/* jshint +W079 */

// constants
var BRANCH = constants.BRANCH;
var GITHUB_URL_BASE = constants.GITHUB_URL_BASE;
var SIM_INFO_ARRAY = constants.SIM_INFO_ARRAY;
var TITLE = 'PhET Translation Utility (HTML5)';

// globals
var translatedStrings = global.translatedStrings;

// utility function for sending the user to the login page
function sendUserToLoginPage( res, host, destinationUrl ) {
  res.render( 'login-required.html', {
    title: 'Login Required',
    host: host,
    destinationUrl: destinationUrl
  } );
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
  var simInfoArray = JSON.parse( fs.readFileSync( SIM_INFO_ARRAY, 'utf8' ) );
  simInfoArray.sort( function( a, b ) {
    if ( a.simTitle < b.simTitle ) {
      return -1;
    }
    else if ( a.simTitle > b.simTitle ) {
      return 1;
    }
    return 0;
  } );

  res.render( 'translate-home.html', {
    title: TITLE,
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
  var activeSimsPath = '/phetsims/chipper/master/data/active-sims';
  var userId = ( req.session.userId ) ? req.session.userId : 0; // use an id of 0 for localhost testing

  winston.log( 'info', 'loading page for ' + simName + ' ' + targetLocale );

  // get the url of the live sim (from simInfoArray)
  var simUrl;
  var simInfoArray = JSON.parse( fs.readFileSync( SIM_INFO_ARRAY, 'utf8' ) );
  for ( var i = 0; i < simInfoArray.length; i++ ) {
    if ( simInfoArray[ i ].projectName === simName ) {
      simUrl = simInfoArray[ i ].testUrl;
      break;
    }
  }

  winston.log( 'info', 'sending request to ' + simUrl );

  // extract strings from the live sim's html file
  request( simUrl, function( error, response, body ) {
    if ( !error && response.statusCode === 200 ) {
      var i;
      var sims; // array of all active sims

      winston.log( 'info', 'request from ' + simUrl + ' returned successfully' );

      // initialize the sims array from the active-sims file in chipper
      winston.log( 'info', 'sending request to ' + GITHUB_URL_BASE + activeSimsPath );
      request( GITHUB_URL_BASE + activeSimsPath, function( error, response, body ) {
        if ( !error && response.statusCode === 200 ) {
          winston.log( 'info', 'request from ' + GITHUB_URL_BASE + activeSimsPath + ' returned successfully' );
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

        var currentSimStringsArray = [];
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

          var simTitle; // sim title gets filled in here (e.g. Area Builder instead of area-builder)
          var otherSims = []; // other sim dependencies get filled in here (e.g. beers-law-lab when translating concentration)

          // iterate over all projects that this sim takes strings from
          for ( i = 0; i < extractedStrings.length; i++ ) {
            var project = extractedStrings[ i ];
            var strings = englishStrings[ project.projectName ];

            // put the strings under common strings, current sim strings, or sim strings depending on which project they are from
            var array;
            if ( project.projectName === simName ) {
              simTitle = strings[ project.projectName + '.title' ] && strings[ project.projectName + '.title' ].value;
              array = currentSimStringsArray;
            }
            else if ( contains( sims, project.projectName ) ) {
              otherSims.push( project.projectName );
              array = simStringsArray;
            }
            else {
              array = commonStringsArray;
            }

            for ( var j = 0; j < project.stringKeys.length; j++ ) {
              var key = project.stringKeys[ j ];

              var stringVisible = strings.hasOwnProperty( key ) && ( ( strings[ key ].visible === undefined ) ? true : strings[ key ].visible );
              if ( stringVisible ) {

                // data needed to render to the string on the page - the key, the current value, the English value, and the repo
                var stringRenderInfo = {
                  key: key,
                  englishValue: escapeHTML( strings[ key ].value ),
                  repo: project.projectName
                };

                // use saved string if it exists
                if ( savedStrings[ project.projectName ][ key ] ) {
                  winston.log( 'info', 'using saved string ' + key + ': ' + savedStrings[ project.projectName ][ key ] );
                  stringRenderInfo.value = escapeHTML( savedStrings[ project.projectName ][ key ] );
                }
                else {
                  stringRenderInfo.value = translatedStrings[ project.projectName ][ key ] ? escapeHTML( translatedStrings[ project.projectName ][ key ].value ) : '';
                }

                array.push( stringRenderInfo );
              }
              else {
                winston.log( 'info', 'String key ' + project.stringKeys[ j ] + ' not found or not visible' );
              }
            }
          }

          // Pull the username from the cookie
          var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'not logged in';

          // sort the arrays by the english values
          var compare = function( a, b ) {
            if ( a.englishValue.toLowerCase() < b.englishValue.toLowerCase() ) {
              return -1;
            }
            else if ( a.englishValue.toLowerCase() > b.englishValue.toLowerCase() ) {
              return 1;
            }
            return 0;
          };
          simStringsArray.sort( compare );
          commonStringsArray.sort( compare );

          var locale = LocaleInfo.localeInfoArray()[ targetLocale ];

          // Assemble the data that will be supplied to the template.
          var templateData = {
            title: TITLE,
            subtitle: 'Please enter a translation for each English string:',
            destinationLanguage: locale ? locale.name : 'Non existent locale',
            currentSimStringsArray: currentSimStringsArray,
            simStringsArray: simStringsArray,
            commonStringsArray: commonStringsArray,
            simName: simName,
            simTitle: simTitle ? simTitle : simName,
            otherSimNames: otherSims.join( ', ' ),
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
          var stringsFilePath = GITHUB_URL_BASE + '/phetsims/' + projectName + '/master/' + projectName + '-strings_en.json';
          var translatedStringsPath = GITHUB_URL_BASE + '/phetsims/babel/' + BRANCH + '/' + projectName + '/' + projectName + '-strings_' + targetLocale + '.json';

          winston.log( 'info', 'sending request to ' + stringsFilePath );
          request( stringsFilePath, function( error, response, body ) {
            if ( !error && response.statusCode === 200 ) {
              englishStrings[ projectName ] = JSON.parse( body );
              winston.log( 'info', 'request to ' + stringsFilePath + ' returned successfully' );
            }
            else {
              winston.log( 'error', 'request for english strings for project ' + projectName + ' failed. Response code: ' +
                                    response.statusCode + '. URL: ' + stringsFilePath + '. Error: ' + error );
            }
            finished();
          } );

          winston.log( 'info', 'sending request to ' + translatedStringsPath );
          request( translatedStringsPath, function( error, response, body ) {
            if ( !error && response.statusCode === 200 ) {
              translatedStrings[ projectName ] = JSON.parse( body );
              winston.log( 'info', 'request to ' + translatedStringsPath + ' returned successfully' );
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

module.exports.submitStrings = function( req, res ) {
  var simName = req.param( 'simName' );
  var targetLocale = req.param( 'targetLocale' );

  winston.log( 'info', 'queuing string submission for ' + simName + '_' + targetLocale );
  commitQueue.push( {
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

      // data submitted is in the form "[repository] [key]", for example "area-builder area-builder.title"
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