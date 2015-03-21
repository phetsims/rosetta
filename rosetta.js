// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for PhET translation web app.  This is where ExpressJS gets configured and the routes are set up.
 *
 * @author John Blanco
 */

// modules
var express = require( 'express' );
var doT = require( 'express-dot' );
var routes = require( __dirname + '/js/routes' );
var winston = require( __dirname + '/js/logger' )( );

// constants
var LISTEN_PORT = 16372;

// Create and configure the ExpressJS app
var app = express();
app.set( 'views', __dirname + '/html/views' );
app.set( 'view engine', 'dot' );
app.engine( 'html', doT.__express );
// TODO - the following lines came in with the template code used to start this project.  Can they go?
app.use( '/translate/css', express.static( __dirname + '/public/css' ) );
app.use( '/translate/sim/css', express.static( __dirname + '/public/css' ) );
app.use( '/translate/img', express.static( __dirname + '/public/img' ) );
app.use( '/translate/js', express.static( __dirname + '/public/js' ) );
app.use( '/translate/sim/js', express.static( __dirname + '/public/js' ) );
app.use( '/translate/fonts', express.static( __dirname + '/public/fonts' ) );

// need cookieParser middleware before we can do anything with cookies
app.use( express.cookieParser() );

//----------------------------------------------------------------------------
// Set up the routes.  The order matters.
//----------------------------------------------------------------------------

// route that checks whether the user is logged in
app.get( '/translate/*', routes.checkForValidSession );

// landing page for the translation utility
app.get( '/translate/', routes.chooseSimulationAndLanguage );

// route for translating a specific sim to a specific language
app.get( '/translate/sim/:simName?/:targetLocale?', routes.translateSimulation );

// route for extracting strings from a sim
app.get( '/translate/extractStrings', routes.extractStrings );

// fall through route
app.get( '/*', routes.pageNotFound );

// start the server
app.listen( LISTEN_PORT, function() { winston.log( 'info', 'Listening on port ' + LISTEN_PORT ) } );
