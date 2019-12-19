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
const childProcess = require( 'child_process' ); // eslint-disable-line require-statement-match
const getRosettaConfig = require( './getRosettaConfig' );
const cookieParser = require( 'cookie-parser' ); // eslint-disable-line require-statement-match
const doT = require( 'express-dot' ); // eslint-disable-line require-statement-match
const express = require( 'express' );
const { Pool } = require( 'pg' ); //eslint-disable-line
const session = require( 'express-session' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );

// constants
const LISTEN_PORT = 16372;
const { format } = winston;

// add a global handler for unhandled promise rejections
process.on( 'unhandledRejection', error => {

  // generally, this shouldn't happen, so if these are in the log they should be tracked down and fixed
  winston.error( 'unhandled rejection, error.message = ' + error.message );
  winston.error( 'stack = ' + error.stack );
} );

// configure the logger - this uses the default logging level, which may be updated once the configuration is read
// winston.remove( winston.transports.Console );
const consoleTransport = new winston.transports.Console( {
  format: format.combine(
    format.timestamp( {
      format: 'YYYY-MM-DD HH:mm:ss'
    } ),
    format.printf( i => `${i.timestamp} | ${i.level} - ${i.message}` )
  )
} );
winston.add( consoleTransport );

// log startup message now that we have a logger
winston.info( '---- rosetta starting up ----' );
winston.info( 'Node version: ' + process.version );

// log the SHA of rosetta - this may make it easier to duplicate and track down problems
try {
  const sha = childProcess.execSync( 'git rev-parse HEAD' );
  winston.info( 'current SHA: ' + sha.toString() );
}
catch( err ) {
  winston.warn( 'unable to get SHA from git, err: ' + err );
}

// get the configuration information and assign it to a global, this also sets up some process variables
global.config = getRosettaConfig();

winston.info( 'config = ' + JSON.stringify( global.config, null, 2 ) );

// update the logging level in case it was set in the config info
consoleTransport.level = global.config.loggingLevel;

// check that the DB server is running and that a basic query can be performed
// TODO: consider moving this into the shortTermStorage object once it exists
winston.info( 'testing database connection' );
const pool = new Pool();
pool.query( 'SELECT NOW()' )
  .then( response => {
    winston.info( 'database test using SELECT NOW() succeeded, now = ' + response.rows[ 0 ].now );
  } )
  .catch( err => {
    winston.error( 'database connection test failed, short term string storage will probably not work, err = ' + err );
  } );

// add the route handlers, must be required after global.config has been initialized and logger configured
const routeHandlers = require( __dirname + '/routeHandlers' );

// create and configure the ExpressJS app
const app = express();
app.set( 'views', __dirname + '/../html/views' );
app.set( 'view engine', 'dot' );
app.engine( 'html', doT.__express );

// set static directories for css, img, and js
app.use( '/translate/css', express.static( __dirname + '/../css' ) );
app.use( '/translate/img', express.static( __dirname + '/../img' ) );
app.use( '/translate/js', express.static( __dirname ) );

// set up handling for cookies
app.use( cookieParser() );
app.use( session( {
  secret: global.config.rosettaSessionSecret,
  resave: false,
  saveUninitialized: false
} ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

//----------------------------------------------------------------------------
// Set up the routes.  The order matters.
//----------------------------------------------------------------------------

// route for showing the 'down for maintenance' page when needed
if ( !global.config.enabled ) {
  app.get( '/translate', routeHandlers.showOffLinePage );
}

// route that checks whether the user is logged in
app.get( '/translate*', routeHandlers.checkForValidSession );

// the following two routes are for debugging and serve no other purpose
app.post( '/translate*', function( req, res, next ) {
  winston.debug( 'post request received, url = ' + req.url );
  next();
} );
app.get( '/translate*', function( req, res, next ) {
  winston.debug( 'get request received, url = ' + req.url );
  next();
} );

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
app.listen( LISTEN_PORT, function() { winston.info( 'Listening on port ' + LISTEN_PORT ); } );


