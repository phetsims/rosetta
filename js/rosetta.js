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
const cookieParser = require( 'cookie-parser' ); // eslint-disable-line require-statement-match
const doT = require( 'express-dot' ); // eslint-disable-line require-statement-match
const express = require( 'express' );
const getRosettaConfig = require( './getRosettaConfig' );
const { Pool } = require( 'pg' ); // eslint-disable-line
const winston = require( 'winston' );

// Order-Dependent Modules
const session = require( 'express-session' ); // eslint-disable-line require-statement-match
const MemoryStore = require( 'memorystore' )( session );

// Constants
const LISTEN_PORT = 16372;
const { format } = winston;

//===========================================================================//
// Configure Winston (the logger). Use Winston to display information.       //
//===========================================================================//

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

// Add a global handler for unhandled promise rejections.
process.on( 'unhandledRejection', error => {

  // If these are logged, issues should be tracked down and fixed.
  winston.error( `Unhandled rejection. Error Message: ${error.message}.` );
  winston.error( `Error Stack: ${error.stack}.` );
} );

// Log startup message.
winston.info( '========== Rosetta is starting up! ==========' );
winston.info( `Node Version ${process.version}.` );

// Log Rosetta's SHA. This might make it easier to duplicate issues and track them down.
try {

  // TODO: This can be done without two variables.
  // For some reason, "sha.toString()" has a newline. I want the log to look nice, so I'm taking it out.
  const sha = childProcess.execSync( 'git rev-parse HEAD' );
  let shaString = sha.toString();
  shaString = shaString.replace( /\r?\n|\r/, '' );
  winston.info( `Current SHA is ${shaString}.` );
}
catch( error ) {
  winston.warn( `Unable to get SHA from Git. Error: ${error}.` );
}

// TODO: Can this be put before logger set up?
// TODO: This doesn't have anything to do with the logger.
// TODO: Are these "process variables" the variables used by the "pg" module? This is vague.
// TODO: getRosettaConfig really shouldn't be doing multiple things.
// TODO: I don't think using "require('./getRosettaConfig.js')" in each file would be an issue.
// TODO: See https://nodejs.org/docs/latest/api/modules.html#modules_caching.
// Get configuration and assign it to a global. This also sets up some process variables.
global.config = getRosettaConfig();

// Log the config.
winston.info( 'Check your config below and make sure it looks correct!' );
winston.info( JSON.stringify( global.config, null, 2 ) );

// TODO: Why don't we just get the config before setting up the logger so we don't have to update it?
// Update the logging level in case it was set in the config info.
consoleTransport.level = global.config.loggingLevel;

// TODO: Consider moving this into the shortTermStorage object once it exists.
// Check that the database is running and that a basic query can be performed.
winston.info( 'Testing database connection...' ); // TODO: The rest of this doesn't work on macOS (?).
const pool = new Pool();
pool.query( 'SELECT NOW();', ( error, result ) => {
  console.log('Wow, we actually got to this part.');
  if ( error ) {
    winston.error( `Database test using "SELECT NOW()" failed. Error Stack: ${error.stack}.` );
  }
  winston.info( `Database test using "SELECT NOW()" succeeded. Now: ${result.rows[ 0 ].now}.` );
} );

//===========================================================================//
// Set up the app.                                                           //
//===========================================================================//

// TODO: The use of "__dirname" seems inconsistent. It might also be wrong.
// TODO: Read https://stackoverflow.com/questions/8131344/what-is-the-difference-between-dirname-and-in-node-js.
// TODO: . is wherever "node rosetta.js" is run from. But the dev script does "node js/rosetta.js". Maybe the root directory?
// TODO: __dirname is the directory in which rosetta.js lives.
// const path = require("path");
// console.log(". = %s", path.resolve("."));
// console.log("__dirname = %s", path.resolve(__dirname));
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

// TODO: The comments at the end of the lines are vague, and those methods should be renamed.
// TODO: (The methods are in the routeHandlers.js file.)
// Set up testing routes.
app.get( '/translate/test/', routeHandlers.test ); // Display a test HTML page.
app.get( '/translate/runTest/:testID', routeHandlers.runTest ); // Run specific server test.
app.get( '/translate/runTests/', routeHandlers.runTests ); // Run all server tests.

// Set up routes for incorrect URL patterns.
app.get( '/*', routeHandlers.pageNotFound );
app.post( '/*', routeHandlers.pageNotFound );

// Start the server.
app.listen( LISTEN_PORT, () => { winston.info( `Listening on port ${LISTEN_PORT}.` ); } );