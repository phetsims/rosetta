// Copyright 2015-2020, University of Colorado Boulder

/**
 * TODO: This description is generic and vague.
 * Main entry point for PhET translation web app. This is where Express.js gets configured and the routes are set up.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

'use strict';

// Modules
const bodyParser = require( 'body-parser' ); // eslint-disable-line require-statement-match
const childProcess = require( 'child_process' ); // eslint-disable-line require-statement-match
const getRosettaConfig = require( './getRosettaConfig' );
const cookieParser = require( 'cookie-parser' ); // eslint-disable-line require-statement-match
const doT = require( 'express-dot' ); // eslint-disable-line require-statement-match
const express = require( 'express' );
const { Pool } = require( 'pg' ); // eslint-disable-line
const session = require( 'express-session' ); // eslint-disable-line require-statement-match
const MemoryStore = require( 'memorystore' )( session );
const winston = require( 'winston' );

// Constants
const LISTEN_PORT = 16372;
const { format } = winston;

// Add a global handler for unhandled promise rejections.
process.on( 'unhandledRejection', error => {

  // If these are logged, issues should be tracked down and fixed.
  winston.error( `Unhandled rejection. Error Message: ${error.message}.` );
  winston.error( `Error Stack: ${error.stack}.` );
} );

// Configure the logger. Uses default logging level, which can be updated once configuration is read.
const consoleTransport = new winston.transports.Console( {
  format: format.combine(
    format.timestamp( {
      format: 'YYYY-MM-DD HH:mm:ss'
    } ),
    format.printf( i => `${i.timestamp} | ${i.level} - ${i.message}` )
  )
} );
winston.add( consoleTransport );

// Log startup message.
winston.info( '========== Rosetta is starting up! ==========' );
winston.info( `Node Version: ${process.version}.` );

// Log Rosetta's SHA. This might make it easier to duplicate issues and track them down.
try {
  const sha = childProcess.execSync( 'git rev-parse HEAD' );
  winston.info( `Current SHA: ${sha.toString()}.` );
}
catch( error ) {
  winston.warn( `Unable to get SHA from Git. Error: ${error}.` );
}

// TODO: Are these "process variables" the variables used by the "pg" module? This is vague.
// Get configuration and assign it to a global. This also sets up some process variables.
global.config = getRosettaConfig();

// TODO: Use new string concatenation. Also, try to give it a newline so it looks nicer.
// Log the config.
winston.info( 'config = ' + JSON.stringify( global.config, null, 2 ) );

// TODO: Why don't we just get the config before this so we don't have to update it?
// update the logging level in case it was set in the config info
consoleTransport.level = global.config.loggingLevel;

// TODO: Consider moving this into the shortTermStorage object once it exists.
// Check that the database is running and that a basic query can be performed.
winston.info( 'Testing database connection...' );
const pool = new Pool();
pool.query( 'SELECT NOW()' )
  .then( response => {
    winston.info( 'Database test using SELECT NOW() succeeded. Now: ' + response.rows[ 0 ].now );
  } )
  .catch( error => {
    winston.error( `Database connection test failed, short-term string storage won't work. Error: ${error}.` );
  } );

// Add route handlers. Must be required after global.config has been initialized and logger configured.
const routeHandlers = require( __dirname + '/routeHandlers' );

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

//================================================================//
// Set up the routes. The order in which they are set up matters! //
//================================================================//

// TODO: "Offline" is one word, and thus "showOffLinePage" should be "showOfflinePage".
// Set up route for the 'down for maintenance' page.
if ( !global.config.enabled ) {
  app.get( '/translate', routeHandlers.showOffLinePage );
}

// Set up route for checking if a user is logged in.
app.get( '/translate*', routeHandlers.checkForValidSession );

// Set up routes for debugging.
app.post( '/translate*', function( request, response, next ) {
  winston.debug( 'post request received, url = ' + request.url );
  next();
} );
app.get( '/translate*', function( request, response, next ) {
  winston.debug( 'get request received, url = ' + request.url );
  next();
} );

// landing page for the translation utility
app.get( '/translate', routeHandlers.chooseSimulationAndLanguage );

// route for rendering the page where the user can submit their translated string
app.get( '/translate/sim/:simName?/:targetLocale?', routeHandlers.renderTranslationPage );

// Set up post route for testing translated strings. This doesn't save the translated strings.
app.post( '/translate/sim/test/:simName?', routeHandlers.testStrings );

// Set up post route for short-term storage of strings.
app.post( '/translate/sim/save/:simName?/:targetLocale?', routeHandlers.saveStrings );

// Set up post route for long-term storage of strings.
app.post( '/translate/sim/:simName?/:targetLocale?', routeHandlers.submitStrings );

// Set up logout route.
app.get( '/translate/logout', routeHandlers.logout );

// TODO: The comments at the end of the lines are vague, and those methods should be renamed.
// Set up testing routes.
app.get( '/translate/test/', routeHandlers.test ); // Display a test HTML page.
app.get( '/translate/runTest/:testID', routeHandlers.runTest ); // Run specific server test.
app.get( '/translate/runTests/', routeHandlers.runTests ); // Run all server tests.

// Set up routes for incorrect URL patterns.
app.get( '/*', routeHandlers.pageNotFound );
app.post( '/*', routeHandlers.pageNotFound );

// Start the server.
app.listen( LISTEN_PORT, function() { winston.info( 'Listening on port ' + LISTEN_PORT ); } );