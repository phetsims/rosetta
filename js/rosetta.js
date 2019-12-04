// Copyright 2015-2019, University of Colorado Boulder

/**
 * Main entry point for PhET translation web app. This is where ExpressJS gets configured and the routes are set up.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

'use strict';

// modules
const bodyParser = require( 'body-parser' ); // eslint-disable-line require-statement-match
const configureStartup = require( './configureStartup' );
const cookieParser = require( 'cookie-parser' ); // eslint-disable-line require-statement-match
const doT = require( 'express-dot' ); // eslint-disable-line require-statement-match
const dotenv = require( 'dotenv' );
const express = require( 'express' );
const session = require( 'express-session' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );

// set up environment variables defined in /rosetta/.env
const config = dotenv.config();

// constants
const LISTEN_PORT = 16372;

// The following flag is used to take this utility off line and show a "down for maintenance" sort of page to users.
// This is generally set by editing the in situ version, and should never be committed to the code base as false.
const ENABLED = config.error ? true : process.env.ENABLED;

// Configuration boiler plate like logger setup, preferences file validation, and command line argument parsing
configureStartup().then( () => {

  // add the route handlers, must be required after global.preferences has been initialized and logger configured
  const routeHandlers = require( __dirname + '/routeHandlers' );

  // Create and configure the ExpressJS app
  const app = express();
  app.set( 'views', __dirname + '/../html/views' );
  app.set( 'view engine', 'dot' );
  app.engine( 'html', doT.__express );

  // set static directories for css, img, and js
  app.use( '/translate/css', express.static( __dirname + '/../css' ) );
  app.use( '/translate/img', express.static( __dirname + '/../img' ) );
  app.use( '/translate/js', express.static( __dirname ) );

  // need cookieParser middleware before we can do anything with cookies
  app.use( cookieParser() );
  app.use( session( {
    secret: global.preferences.rosettaSessionSecret,
    resave: false,
    saveUninitialized: false
  } ) );
  app.use( bodyParser.json() );
  app.use( bodyParser.urlencoded( { extended: false } ) );

  //----------------------------------------------------------------------------
  // Set up the routes.  The order matters.
  //----------------------------------------------------------------------------

  // route for showing the 'down for maintenance' page when needed
  if ( !ENABLED ) {
    app.get( '/translate', routeHandlers.showOffLinePage );
  }

  // route that checks whether the user is logged in
  app.get( '/translate*', routeHandlers.checkForValidSession );

  // TODO: the following two routes are for debugging, and should be removed or put behind a "verbose" flag eventually
  app.post( '/translate*', function( req, res, next ) {
    winston.info( 'post request received, url = ' + req.url );
    next();
  } );
  app.get( '/translate*', function( req, res, next ) {
    winston.info( 'get request received, url = ' + req.url );
    next();
  } );
  // end of loggers

  // landing page for the translation utility
  app.get( '/translate', routeHandlers.chooseSimulationAndLanguage );

  // route for rendering the page where the user can submit their translated string
  app.get( '/translate/sim/:simName?/:targetLocale?', routeHandlers.renderTranslationPage );

  // post route for testing translated strings (does not save them)
  app.post( '/translate/sim/test/:simName?', routeHandlers.testStrings );

  // post route for short term storage of strings
  app.post( '/translate/sim/save/:simName?/:targetLocale?', routeHandlers.saveStrings );

  // post route for long term storage of strings
  app.post( '/translate/sim/:simName?/:targetLocale?', routeHandlers.submitStrings );

  // route for extracting strings from a sim
  app.get( '/translate/extractStrings', routeHandlers.extractStringsAPI );

  // logout
  app.get( '/translate/logout', routeHandlers.logout );

  // test routes - used for testing and debugging
  app.get( '/translate/test/', routeHandlers.test ); // display a test html page
  app.get( '/translate/runTest/:testID', routeHandlers.runTest ); // run specific server test
  app.get( '/translate/runTests/', routeHandlers.runTests ); // run all server tests

  // fall through route
  app.get( '/*', routeHandlers.pageNotFound );
  app.post( '/*', routeHandlers.pageNotFound );

  // start the server
  app.listen( LISTEN_PORT, function() { winston.log( 'info', 'Listening on port ' + LISTEN_PORT ); } );
} );


