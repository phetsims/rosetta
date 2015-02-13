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

  // check whether the session cookie exists at all
  console.log( 'Checking for login cookie (bypassed for localhost)' );
  console.log( 'req.get( \'host\' ) = ' + req.get( 'host' ) );
  var cookie = req.cookies.JSESSIONID;
  if ( req.get( 'host' ).indexOf( 'localhost' ) === 0 || cookie === undefined ) {
    // no session cookie present, the user must log in
    console.log( 'session cookie not found, sending to login page' );
    console.log( 'host = ' + req.get( 'host' ) );
    console.log( 'req.url = ' + req.url );
    sendUserToLoginPage( res, req.get( 'host' ), req.url );
  }
  else {
    // session cookie was present, attempt to obtain session information
    var options = {
      host: req.get( 'host' ),
      path: '/check-login',
      method: 'GET',
      headers: {
        'Cookie': 'JSESSIONID=' + cookie
      }
    };

    var sessionDataRequestCallback = function( response ) {
      var data = '';

      // another chunk of data has been recieved, so append it
      response.on( 'data', function( chunk ) {
        data += chunk;
      } );

      // the whole response has been recieved - see if the credentials are valid
      response.on( 'end', function() {
        console.log( 'data received: ' + data );
        // TODO: The response as of Feb 13 2015 is JSON enclosed in XML.  The XML will eventually be eliminated, and
        // when it is, the following code for extracting the JSON part should be removed.
        var jsonStartIndex = data.indexOf( '{' );
        var jsonEndIndex = data.indexOf( '}' ) + 1;
        var jsonUserData = data.substring( jsonStartIndex, jsonEndIndex );
        // TODO: The response as of Feb 13 2015 doesn't appear to be property formed JSON (at least not as I
        // understand it) because the keys and values aren't quoted.  The following code handles this case, and should
        // be removed once the issue is fixed.
        if ( jsonUserData.indexOf( '\"' ) < 0 ) {
          console.log( 'adding quotes to json user data' );
          jsonUserData = jsonUserData.replace( /{ /g, '{ \"' );
          jsonUserData = jsonUserData.replace( / }/g, '\" }' );
          jsonUserData = jsonUserData.replace( /: /g, '\": \"' );
          jsonUserData = jsonUserData.replace( /, /g, '\", \"' );
        }
        console.log( 'json user data: ' + jsonUserData );
        var userData = JSON.parse( jsonUserData );
        if ( userData.loggedIn ) {
          console.log( 'credentials obtained, user logged in, moving to next step' );
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
    requestCredentials.on( 'error', function( err ){
      console.log( 'error retrieving session data: ' + err );
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
  var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'Not logged in';

  res.render( 'translate-home.html', {
    title: 'PhET Translation Utility',
    simInfoArray: TranslatableSimInfo.simInfoArray,
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
  var path = '/phetsims/' + simName + '/master/strings/' + simName + '-strings_en.json';

  // Pull the English string data from github.
  https.get( { host: 'raw.githubusercontent.com', path: path }, function( response ) {
    response.on( 'data', function( data ) {

      if ( response.statusCode === 200 ) {
        // Parse the returned JSON data into a JavaScript object.
        var strings = JSON.parse( data );

        // Create the strings array to pass in to the HTML template
        var englishStringsArray = [];
        for ( var key in strings ) {
          if ( strings.hasOwnProperty( key ) ) {
            englishStringsArray.push( {
              key: key,
              string: escapeHTML( strings[ key ] )
            } );
          }
        }

        // Pull the username from the cookie
        var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'Not logged in';

        // Assemble the data that will be supplied to the template.
        var templateData = {
          title: "PhET Translation Utility",
          subtitle: "Please enter a translation for each English string:",
          destinationLanguage: LocaleInfo.localeToLanguageString( targetLocale ),
          englishStringsArray: englishStringsArray,
          simName: simName,
          simUrl: TranslatableSimInfo.getSimInfoByProjectName( simName ).testUrl,
          username: username
        };

        // Render the page.
        res.render( 'translate-sim.html', templateData );
      }
      else {
        res.send( 'Error: Sim data not found' );
      }
    } );
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
