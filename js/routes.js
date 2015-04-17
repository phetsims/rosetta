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
  var simPath = '/phetsims/' + simName + '/master/strings/' + simName + '-strings_en.json';
  var activeSimsPath = '/phetsims/chipper/master/data/active-sims';

  // get the url of the live sim (from simInfoArray)
  var simUrl;
  for ( var i = 0; i < simInfoArray.length; i++ ) {
    if ( simInfoArray[ i ].projectName === simName ) {
      simUrl = simInfoArray[ i ].testUrl;
      break;
    }
  }

  var sims; // array of all active sims, will be initialized in activeSimsRequestCallback
  var result = []; // array of { projectName: {string}, stringKeys: {Array.<string>} }, initialized in stringExtractRequestCallback

  var activeSimsUrl = rawGithub + activeSimsPath;
  var englishStringsUrl = rawGithub + simPath;

  // convenience method to check if an item is in an array
  var contains = function( array, item ) {
    for ( var i = 0; i < array.length; i++ ) {
      if ( array[ i ] === item ) {
        return true;
      }
    }
    return false;
  };

  // get a list of all active sims from github to separate common strings from sim strings
  var activeSimsRequestCallback = function( error, response, body ) {
    if ( !error && response.statusCode == 200 ) {
      sims = body.toString().split( '\n' );
    }
    request( simUrl, stringExtractRequestCallback );
  };

  // extract strings from the live sim's html file
  var stringExtractRequestCallback = function( error, response, body ) {
    if ( !error && response.statusCode == 200 ) {
      TranslationUtils.extractStrings( result, body );
    }
    else {
      winston.log( 'error', error );
    }
    request( englishStringsUrl, englishStringsRequestCallback );
  };

  // Pull the English string data from github.
  var englishStringsRequestCallback = function( error, response, body ) {
    if ( !error && response.statusCode == 200 ) {
      var strings = JSON.parse( body );

      var englishStringsArray = [];
      var commonStringsArray = [];

      // iterate over all projects that this sim takes strings from
      for ( var i = 0; i < result.length; i++ ) {
        var project = result[ i ];

        // put the strings under common strings or sim strings depending on which project they are from
        var array = ( contains( sims, project.projectName ) ) ? englishStringsArray : commonStringsArray;
        for ( var j = 0; j < project.stringKeys.length; j++ ) {
          var key = project.stringKeys[ j ];
          if ( strings.hasOwnProperty( key ) ) {
            array.push( {
              key: key,
              string: escapeHTML( strings[ key ] )
            } );
          }

          // if an english string isn't found for a key, use the key name instead
          else {
            array.push( {
              key: key,
              string: key
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
        englishStringsArray: englishStringsArray,
        commonStringsArray: commonStringsArray,
        simName: simName,
        simUrl: TranslatableSimInfo.getSimInfoByProjectName( simName ).testUrl,
        username: username,
        trustedTranslator: ( req.session.trustedTranslator ) ? req.session.trustedTranslator : false
      };

      // Render the page.
      res.render( 'translate-sim.html', templateData );
    }
    else {
      res.send( 'Error: Sim data not found' );
    }
  };

  request( activeSimsUrl, activeSimsRequestCallback );
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
