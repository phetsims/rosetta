// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for PhET translation web app.
 */

// modules
var express = require( 'express' );
var https = require( 'https' );
var doT = require( 'express-dot' );
var LocaleInfo = require( __dirname + '/js/LocaleInfo' );
var TranslatableSimInfo = require( __dirname + '/js/TranslatableSimInfo' );

// constants
var LISTEN_PORT = 16372;

// Create and configure the ExpressJS app
var app = express();
app.set( 'views', __dirname + '/html/views' );
app.set( 'view engine', 'dot' );
app.engine( 'html', doT.__express );
app.use( '/translate/css', express.static( __dirname + '/public/css' ) );
app.use( '/translate/sim/css', express.static( __dirname + '/public/css' ) );
app.use( '/translate/img', express.static( __dirname + '/public/img' ) );
app.use( '/translate/js', express.static( __dirname + '/public/js' ) );
app.use( '/translate/sim/js', express.static( __dirname + '/public/js' ) );
app.use( '/translate/fonts', express.static( __dirname + '/public/fonts' ) );

//----------------------------------------------------------------------------
// Set up the routes
//----------------------------------------------------------------------------

// convenience function for presenting escaped HTML
function escapeHTML( s ) {
  return s.replace( /&/g, '&amp;' )
    .replace( /"/g, '&quot;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' );
}

// need cookieParser middleware before we can do anything with cookies
app.use( express.cookieParser() );

// check for the presence of the PhET login cookie
app.get( '/translate/*', function( req, res, next ) {
  console.log( 'all cookies :' );
  for ( var k in req.cookies ) {
    if ( req.cookies.hasOwnProperty( k ) ) {
      console.log( "Key is " + k + ", value is: " + req.cookies[ k ] );
    }
  }
  console.log( '------------' );
  console.log( 'Checking for login cookie (bypassed for localhost)' );
  var cookie = req.cookies.JSESSIONID;
  //if ( req.get( 'host' ).indexOf( 'localhost' ) !== 0 && cookie === undefined ) {
  if ( cookie === undefined ) {
    // no: the user must log in
    console.log( 'session cookie not found, sending to login page' );
    console.log( 'host = ' + req.get( 'host' ) );
    console.log( 'req.url = ' + req.url );
    res.render( 'login-required.html', { title: 'Login Required', host: req.get( 'host' ), destinationUrl: req.url } );
  }
  else {
    // yes, cookie was present, go to the next route
    console.log( 'session cookie found, moving to next step' );
    next(); // send to next route
  }
} );

// Initial page for the translation utility
app.get( '/translate/', function( req, res, next ) {

  // Pull the username from the cookie
  var username = req.cookies[ 'sign-in-panel.sign-in-form.username' ] || 'Not logged in';

  res.render( 'translate-home.html', {
    title: 'PhET Translation Utility',
    simInfoArray: TranslatableSimInfo.simInfoArray,
    username: username
  } );
} );

// route for translating a specific sim to a specific language
app.get( '/translate/sim/:simName?/:targetLocale?', function( req, res ) {
  var simName = req.param( 'simName' );
  var targetLocale = req.param( 'targetLocale' );
  var path = '/phetsims/' + simName + '/master/strings/' + simName + '-strings_en.json';

  // Pull the English string data from github.
  https.get( { host: 'raw.githubusercontent.com', path: path }, function( response ) {
    response.on( 'data', function( data ) {

      if ( response.statusCode === 200 ) {
        // Parse the returned JSON data into a JavaScript object.
        strings = JSON.parse( data );

        // Create a table for the strings to be translated.
        //var stringsTable = '';
        //for ( var key in strings ) {
        //  if ( strings.hasOwnProperty( key ) ) {
        //    stringsTable += '<tr data-string-key=' + key + '>';
        //    stringsTable += '<td>' + escapeHTML( strings[ key ] ) + '</td>';
        //    stringsTable += '<td><input type=\"text\" </td>';
        //    stringsTable += '</tr>';
        //  }
        //}

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
} );

app.get( '/*', function( req, res ) {
  res.send( '<p>Error: Page not found.  URL = ' + req.url + '</p>' );
} );

app.listen( LISTEN_PORT, function() { console.log( 'Listening on port ' + LISTEN_PORT ) } );
