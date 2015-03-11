// Copyright 2002-2015, University of Colorado Boulder

/**
 * ExpressJS-style routes for handling the various URLs for the translation utility.
 *
 * @author John Blanco
 */

// modules
var https = require( 'https' );
var http = require( 'http' );
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

  if ( req.get( 'host' ).indexOf( 'localhost' ) === 0 ) {
    // bypass credential evaluation to allow testing on localhost
    console.log( 'Bypassing session validation to allow testing on localhost' );
    next(); // send to next route
    return;
  }

  // check whether the session cookie exists
  console.log( 'Checking for login cookie' );
  var cookie = req.cookies.JSESSIONID;
  if ( cookie === undefined ) {
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

      // another chunk of data has been received, so append it
      response.on( 'data', function( chunk ) {
        data += chunk;
      } );

      // the whole response has been received - see if the credentials are valid
      response.on( 'end', function() {
        console.log( 'data received: ' + data );
        var userData = JSON.parse( data );
        if ( userData.loggedIn ) {
          console.log( 'credentials obtained, user is logged in, moving to next step' );
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
  var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'not logged in';

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
        var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'not logged in';

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

/**
 * Route that extracts strings from a built sim. Expects query parameters 'host' and 'path'.
 * See the defaults for host and path for an example.
 *
 * TODO: This may not be a route in the future, maybe it should just be a method?
 *
 * @param req
 * @param res
 */
module.exports.extractStrings = function( req, res ) {
  var host = req.param( 'host' ) || 'www.colorado.edu'; // included for an easy default test
  var path = req.param( 'path' ) || '/physics/phet/dev/html/arithmetic/1.0.0-dev.13/arithmetic_en.html';

  var options = {
    host: host,
    path: path,
    method: 'GET'
  };

  // convenience method to check if an item is in an array
  var contains = function( array, item ) {
    for ( var i = 0; i < array.length; i++ ) {
      if ( array[i] === item ) {
        return true;
      }
    }
    return false;
  };

  var sessionDataRequestCallback = function( response ) {
    var data = '';

    // another chunk of data has been received, so append it
    response.on( 'data', function( chunk ) {
      data += chunk;
    } );

    // the whole response has been received
    response.on( 'end', function() {
      var result = [];
      var projects = {};
      var matches = data.match( /string!([\w\.\/]+)/g );

      // if no matches are found, it probably means the sim url was not correct
      if ( matches === null ) {
        res.send( '<p>Error: No strings found at ' + host + path + '</p>' );
      }

      for ( var i = 0; i < matches.length; i++ ) {
        var projectAndString = matches[i].substring( 7 ).split( '/' );
        var projectName = projectAndString[0];
        var string = projectAndString[1];

        projects[projectName] = projects[projectName] || [];

        if ( !contains( projects[projectName], string ) ) {
          projects[projectName].push( string );
        }
      }

      for ( var project in projects ) {
        result.push( {
          projectName: project.replace( '_', '-' ).toLowerCase(),
          stringKeys: projects[project]
        } );
      }

      res.setHeader( 'Content-Type', 'application/json' );
      res.end( JSON.stringify( result, null, 3 ) );
    } );
  };

  var strings = http.request( options, sessionDataRequestCallback );

  strings.on( 'error', function( err ) {
    console.log( 'Error getting sim strings - ' + err );
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
}
