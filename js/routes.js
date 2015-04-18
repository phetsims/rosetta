// Copyright 2002-2015, University of Colorado Boulder

/**
 * ExpressJS-style routes for handling the various URLs for the translation utility.
 *
 * @author John Blanco
 */

// modules
var https = require( 'https' );
var LocaleInfo = require( './LocaleInfo' );
var TranslatableSimInfo = require( './TranslatableSimInfo' );
var simInfoArray = require( '../data/simInfoArray.json' );
var TranslationUtils = require( './TranslationUtils' );
var winston = require( 'winston' );
var request = require( 'request' );
var _ = require( 'underscore' );
var contains = TranslationUtils.contains;
var getGhClient = TranslationUtils.getGhClient;
var commit = TranslationUtils.commit;
var stringify = TranslationUtils.stringify;

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
        if ( userData.teamMember ) {
          winston.log( 'info', 'User is detected as being a PhET team member' );
          req.session.teamMember = true;
        }
        else {
          req.session.teamMember = false;
        }
        if ( userData.trustedTranslator ) {
          winston.log( 'info', 'User is detected as being a PhET team member' );
          req.session.trustedTranslator = true;
        }
        else {
          req.session.trustedTranslator = false;
        }
        if ( userData.loggedIn ) {
          winston.log( 'info', 'credentials obtained, user is logged in, moving to next step' );
          next(); // send to next route
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
    if ( !error && response.statusCode == 200 ) {
      var i;
      var sims; // array of all active sims

      // initialize the sims array from the active-sims file in chipper
      request( rawGithub + activeSimsPath, function( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
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
      var translatedStrings = {}; // object to hold the already translated strings

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
                string: escapeHTML( strings[ key ] ),
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
          var stringsFilePath = rawGithub + '/phetsims/' + projectName + '/master/strings/' + projectName + '-strings_en.json';
          var translatedStringsPath = rawGithub + '/phetsims/babel/master/' + projectName + '/' + projectName + '-strings_' + targetLocale + '.json';

          request( stringsFilePath, function( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
              englishStrings[ projectName ] = JSON.parse( body );
            }
            else {
              winston.log( 'error', error );
            }
            finished();
          } );

          request( translatedStringsPath, function( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
              translatedStrings[ projectName ] = JSON.parse( body );
            }
            else {
              winston.log( 'warn', 'Github responded with a ' + response.statusCode + ' status code for url ' + translatedStringsPath +
                                   '. Mostly likely the file does not exist on github' );
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
  var targetLocale = req.param( 'targetLocale' );
  var ghClient = getGhClient();
  var babel = ghClient.repo( 'phetsims/babel' );

  var repos = {};

  for ( var string in req.body ) {
    if ( req.body.hasOwnProperty( string ) ) {
      var repoAndKey = string.split( ' ' );
      var repo = repoAndKey[ 0 ];
      var key = repoAndKey[ 1 ];

      if ( !repos[ repo ] ) {
        repos[ repo ] = [];
      }
      if ( req.body[ string ] !== '' ) {
        var stringObject = {};
        stringObject[ key ] = { 'value': req.body[ string ], 'history': [] };
        repos[ repo ].push( stringObject );
      }
    }
  }

  for ( var repository in repos ) {
    if ( req.body.hasOwnProperty( string ) ) {
      var branch = 'tests';
      var strings = repos[ repository ];
      var content = stringify( strings );

      if ( content.length ) {
        var file = repository + '/' + repository + '-strings_' + targetLocale + '.json';
        var commitMessage = Date.now() + ' automated commit from rosetta for file ' + file;

        commit( babel, file, content, commitMessage, branch );
        winston.log( 'info', commitMessage );
      }
    }
  }

  res.send( 'Strings submitted' );
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
