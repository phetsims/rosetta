// Copyright 2015-2020, University of Colorado Boulder

/**
 * TODO: Relocate code in this file that doesn't have to do with configuring the app, setting up routes, etc. See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
 * Main entry point for PhET translation web app. This is where Express.js gets configured and the routes are set up.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Liam Mulhall
 */

'use strict';

// modules
const bodyParser = require( 'body-parser' ); // eslint-disable-line require-statement-match
const childProcess = require( 'child_process' ); // eslint-disable-line require-statement-match
const cookieParser = require( 'cookie-parser' ); // eslint-disable-line require-statement-match
const doT = require( 'express-dot' ); // eslint-disable-line require-statement-match
const express = require( 'express' );
const getRosettaConfig = require( './getRosettaConfig' );
const { Pool } = require( 'pg' ); // eslint-disable-line
const RosettaConstants = require( './RosettaConstants' );
const winston = require( 'winston' );
const ensureValidSession = require( './ensureValidSession' );

// order-dependent Modules
const session = require( 'express-session' ); // eslint-disable-line require-statement-match
const MemoryStore = require( 'memorystore' )( session );

// constants
const LISTEN_PORT = 16372;
const { format } = winston;

//===========================================================================//
// Configure Winston (the logger). Use Winston to display information.       //
//===========================================================================//

// Configure the logger. Uses default logging level, which can be updated once configuration is read.
const consoleTransport = new winston.transports.Console( {
  format: format.combine(
    format.printf( i => `${i.level} - ${i.message}` )
  )
} );
winston.add( consoleTransport );

// Add a global handler for unhandled promise rejections.
process.on( 'unhandledRejection', error => {

  // If these are logged, issues should be tracked down and fixed.
  winston.error( `Unhandled rejection. Error Message: ${error.message}` );
  winston.error( `Error Stack: ${error.stack}` );
} );

// Log startup message.
winston.info( '========== Rosetta is starting up! ==========' );
winston.info( `Node Version ${process.version}` );

// Log Rosetta's SHA. This might make it easier to duplicate issues and track them down.
try {

  // For some reason, "sha.toString()" has a newline. I want the log to look nice, so I'm taking it out.
  let sha = childProcess.execSync( 'git rev-parse HEAD' );
  sha = sha.toString();
  sha = sha.replace( /\r?\n|\r/, '' );
  winston.info( `Current SHA is ${sha}` );
}
catch( error ) {
  winston.warn( `Unable to get SHA from Git. Error: ${error}` );
}

// TODO: Move this to a more appropriate location. See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
// TODO: Determine if setting a variable for the config is preferable to this approach. See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
// Get configuration and assign it to a global. This also sets up some process variables.
global.config = getRosettaConfig();

// Log the config.
winston.info( 'Check your config below and make sure it looks correct!' );
winston.info( JSON.stringify( global.config, null, 2 ) );

// TODO: Determine if it's possible to get the config before setting up the logger. (So we don't have to update it.) See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
// Update the logging level in case it was set in the config info.
// If you want to use QUnit, you should set the loggingLevel in your config to emerg
consoleTransport.level = global.config.loggingLevel;

// TODO: Move this into its own file. See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
// Check that the database is running and that a basic query can be performed.
winston.info( 'Testing database connection...' );
const pool = new Pool( {
  connectionTimeoutMillis: RosettaConstants.DATABASE_QUERY_TIMEOUT
} );
pool.query( 'SELECT NOW();', ( error, result ) => {
  if ( error ) {
    winston.error( 'Database test using SELECT NOW() failed. Error: ' + JSON.stringify( error ) );
    winston.error( 'Short term storage will be unavailable.' );
  }
  else {
    winston.info( `Database test using SELECT NOW() succeeded. Now: ${result.rows[ 0 ].now}` );
  }
} );

//===========================================================================//
// Set up the app.                                                           //
//===========================================================================//

// Create and configure the Express.js app.
const app = express();
app.set( 'views', __dirname + '/../html/views' );
app.set( 'view engine', 'dot' );
app.engine( 'html', doT.__express );

// Set static directories for CSS, images, and JavaScript.
app.use( '/translate/css', express.static( __dirname + '/../css' ) );
app.use( '/translate/img', express.static( __dirname + '/../img' ) );
app.use( '/translate/js', express.static( __dirname ) );

// Set up handling for cookies.
app.use( cookieParser() );
app.use( session( {
  secret: global.config.rosettaSessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore( {
    checkPeriod: 86400000 // In milliseconds. Set to 1 day.
  } )
} ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

//===========================================================================//
// Set up the routes. The order in which they are set up matters!            //
//===========================================================================//

// Add route handlers. Must be after global.config has been initialized and logger configured.
const routeHandlers = require( __dirname + '/routeHandlers' );

// Set up route for the 'down for maintenance' page.
if ( !global.config.enabled ) {
  app.get( '/translate', routeHandlers.showOfflinePage );
}

// Set up route for checking if a user is logged in.
app.get( '/translate*', ensureValidSession );
// app.get( '/translate*', routeHandlers.checkForValidSession );

// Set up routes for debugging.
app.post( '/translate*', function( request, response, next ) {
  winston.debug( `Post request received. URL: ${request.url}.` );
  next();
} );
app.get( '/translate*', function( request, response, next ) {
  winston.debug( `Get request received. URL: ${request.url}.` );
  next();
} );

// Set up landing page for the translation utility.
app.get( '/translate', routeHandlers.chooseSimulationAndLanguage );

// Set up page where user can submit their translated strings.
app.get( '/translate/sim/:simName?/:targetLocale?', routeHandlers.renderTranslationPage );

// Set up post route for testing translated strings. This doesn't save the translated strings.
app.post( '/translate/sim/test/:simName?', routeHandlers.testStrings );

// Set up post route for short-term storage of strings.
app.post( '/translate/sim/save/:simName?/:targetLocale?', routeHandlers.saveStrings );

// Set up post route for long-term storage of strings.
app.post( '/translate/sim/:simName?/:targetLocale?', routeHandlers.submitStrings );

// Set up logout.
app.get( '/translate/logout', routeHandlers.logout );

// Trigger the build of a simulation for a given sim, locale, and user ID. Only used by team members to fix problems.
app.get( '/translate/trigger-build/:simName?/:targetLocale?/:userId?', routeHandlers.triggerBuild );

// Routes for info on untranslated strings and simulations.
app.get( '/translate/get-untranslated-strings/:simName?/:targetLocale?/', routeHandlers.renderUntranslatedKeysAndValues );
app.get( '/translate/get-all-untranslated-strings/:targetLocale?/', routeHandlers.renderAllUntranslatedKeysAndValues );
app.get( '/translate/get-untranslated-strings-stats/:targetLocale?/', routeHandlers.renderUntranslatedStringsStats );

// Set up testing routes.
app.get( '/translate/test/', routeHandlers.displayTestPage );
app.get( '/translate/runSpecificTest/:testID', routeHandlers.runSpecificTest );
app.get( '/translate/runAllTests/', routeHandlers.runAllTests );

// Set up routes for incorrect URL patterns.
app.get( '/*', routeHandlers.pageNotFound );
app.post( '/*', routeHandlers.pageNotFound );

// Start the server.
app.listen( LISTEN_PORT, () => {
  winston.info( `Listening on port ${LISTEN_PORT}.` );
  winston.info( `Open your browser to http://localhost:${LISTEN_PORT}/translate` );
} );