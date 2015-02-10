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

// Initial page for the translation utility
app.get( '/translate/', function( req, res ) {
  res.render( __dirname + '/html/views/translate-home.html', { simInfoArray: TranslatableSimInfo.simInfoArray } );
} );

// Handle a URL to translate a specific simulation.
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
        var stringsTable = '';
        for ( var key in strings ) {
          if ( strings.hasOwnProperty( key ) ) {
            stringsTable += '<tr data-string-key=' + key + '>';
            stringsTable += '<td>' + escapeHTML( strings[ key ] ) + '</td>';
            stringsTable += '<td><input type=\"text\" </td>';
            stringsTable += '</tr>';
          }
        }

        // Assemble the data that will be supplied to the template.
        var templateData = {
          title: "PhET Translation Utility",
          subtitle: "Please enter a translation for each English string:",
          destinationLanguage: LocaleInfo.localeToLanguageString( targetLocale ),
          stringsTable: stringsTable,
          //simUrl: TranslatableSimInfo.getSimTestUrl( simName )
          simName: simName,
          simUrl: 'http://localhost/git-dev/' + simName + '/' + simName + '_en.html'
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
