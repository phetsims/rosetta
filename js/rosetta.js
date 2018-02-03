// Copyright 2017, University of Colorado Boulder

/**
 * Main entry point for PhET translation web app. This is where ExpressJS gets configured and the routes are set up.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

/* eslint-env node */
'use strict';

// modules
const assert = require( 'assert' );
const bodyParser = require( 'body-parser' ); // eslint-disable-line require-statement-match
const cookieParser = require( 'cookie-parser' ); // eslint-disable-line require-statement-match
const dateformat = require( 'dateformat' );
const doT = require( 'express-dot' ); // eslint-disable-line require-statement-match
const express = require( 'express' );
const fs = require( 'fs' );
const parseArgs = require( 'minimist' ); // eslint-disable-line require-statement-match
const query = require( 'pg-query' ); // eslint-disable-line require-statement-match
const session = require( 'express-session' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );

// constants
const LISTEN_PORT = 16372;
let PREFERENCES_FILE;

// The following flag is used to take this utility off line and show a "down for maintenance" sort of page to users.
// This is generally set by editing the in situ version, and should never be committed to the code base as false.
const ENABLED = false;

/*
 * Rosetta is run under user "phet-admin" on the dev and production servers. However, "process.env.HOME" will get
 * the user who is starting the process's home directory, not phet-admin's home directory, therefore we need to use
 * the following approach to get the home directory.
 */
if ( !/^win/.test( process.platform ) ) {
  const passwdUser = require( 'passwd-user' ); // eslint-disable-line require-statement-match
  PREFERENCES_FILE = passwdUser.sync( process.getuid() ).homedir + '/.phet/build-local.json';
}
else {
  PREFERENCES_FILE = process.env.HOME + '/.phet/build-local.json';
}

// ensure that the preferences file exists and has the required fields
assert( fs.existsSync( PREFERENCES_FILE ), 'missing preferences file ' + PREFERENCES_FILE );
const preferences = require( PREFERENCES_FILE );
assert( preferences.githubUsername, 'githubUsername is missing from ' + PREFERENCES_FILE );
assert( preferences.githubPassword, 'githubPassword is missing from ' + PREFERENCES_FILE );
assert( preferences.buildServerAuthorizationCode, 'buildServerAuthorizationCode is missing from ' + PREFERENCES_FILE );
assert( preferences.rosettaSessionSecret, 'rosettaSessionSecret is missing from ' + PREFERENCES_FILE +
                                          '. To set this up for local testing add any string as the value for "rosettaSessionSecret"' );
assert( preferences.htmlSimsDirectory, 'Missing htmlSimsDirectory from ' + PREFERENCES_FILE );

preferences.productionServerURL = preferences.productionServerURL || 'https://phet.colorado.edu';
preferences.productionServerName = preferences.productionServerName || 'phet-server.int.colorado.edu';

/*
 * Add "babelBranch": "tests" in build-local.json for rosetta testing, so that commits will change the 'tests' branch
 * of babel instead of master. Make sure to checkout the tests branch in babel on the server as well.
 */
preferences.babelBranch = preferences.babelBranch || 'master';

assert( preferences.babelBranch === 'master' || preferences.babelBranch === 'tests', 'BRANCH must be set to either master or tests' );

// initialize globals
global.preferences = preferences;

// add a global handler for unhandled promise rejections
process.on( 'unhandledRejection', error => {

  // generally, this shouldn't happen, so if these are in the log they should be tracked down and fixed
  winston.log( 'error', 'unhandled rejection, error.message =', error.message );
} );

// add the route handlers, must be required after global.preferences has been initialized
const routeHandlers = require( __dirname + '/routeHandlers' );

// configure postgres connection
if ( preferences.pgConnectionString ) {
  query.connectionParameters = preferences.pgConnectionString;
}
else {
  query.connectionParameters = 'postgresql://localhost/rosetta';
}

// Handle command line input
// First 2 args provide info about executables, ignore
const commandLineArgs = process.argv.slice( 2 );

const parsedCommandLineOptions = parseArgs( commandLineArgs, {
  boolean: true
} );

const defaultOptions = {

  // options for supporting help, currently no other options are supported, but this might change
  help: false,
  h: false
};

for ( const key in parsedCommandLineOptions ) {
  if ( key !== '_' && parsedCommandLineOptions.hasOwnProperty( key ) && !defaultOptions.hasOwnProperty( key ) ) {
    console.log( 'Unrecognized option: ' + key );
    console.log( 'try --help for usage information.' );
    return; // eslint-disable-line
  }
}

// If help flag, print help and usage info
if ( parsedCommandLineOptions.hasOwnProperty( 'help' ) || parsedCommandLineOptions.hasOwnProperty( 'h' ) ) {
  console.log( 'Usage:' );
  console.log( '  node rosetta.js [options]' );
  console.log( '' );
  console.log( 'Options:' );
  console.log(
    '  --help (print usage and exit)\n' +
    '    type: bool  default: false\n' );
  return;
}

// add timestamps
winston.remove( winston.transports.Console );
winston.add( winston.transports.Console, {
  'timestamp': function() {
    const now = new Date();
    return dateformat( now, 'mmm dd yyyy HH:MM:ss Z' );
  }
} );

// log startup message
winston.log( 'info', '---- rosetta starting up ----' );
winston.log( 'info', 'Node version: ' + process.version );

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
  secret: preferences.rosettaSessionSecret,
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
app.post( '/translate*', function( req, res, next ){
  console.log( 'post request received, url = ' + req.url );
  next();
} );
app.get( '/translate*', function( req, res, next ){
  console.log( 'get request received, url = ' + req.url );
  next();
} );
// end of loggers

// landing page for the translation utility
app.get( '/translate', routeHandlers.chooseSimulationAndLanguage );

// route for rendering the page where the user can submit their translated string
app.get( '/translate/sim/:simName?/:targetLocale?', routeHandlers.renderTranslationPage );

// TODO: Temporary route for testing new async rendering method, added 1/18/2018, shouldn't live long after that.
app.get( '/translate/simz/:simName?/:targetLocale?', routeHandlers.renderTranslationPageNew );

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
app.get( '/translate/test/', routeHandlers.test );
app.get( '/translate/runTest/:testID', routeHandlers.runTest );

// fall through route
app.get( '/*', routeHandlers.pageNotFound );
app.post( '/*', routeHandlers.pageNotFound );

// start the server
app.listen( LISTEN_PORT, function() { winston.log( 'info', 'Listening on port ' + LISTEN_PORT ); } );
