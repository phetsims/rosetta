// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for PhET translation web app. This is where ExpressJS gets configured and the routes are set up.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

/* jslint node: true */
'use strict';

// modules
var assert = require( 'assert' );
var bodyParser = require( 'body-parser' );
var dateformat = require( 'dateformat' );
var doT = require( 'express-dot' );
var express = require( 'express' );
var fs = require( 'fs' );
var parseArgs = require( 'minimist' );
var query = require( 'pg-query' );
var winston = require( 'winston' );

// constants
var LISTEN_PORT = 16372;
var PREFERENCES_FILE;

// The following flag is used to take this utility off line and show a "down for maintenance" sort of page to users.
// This is generally set by editing the in situ version, and should never be committed to the code base as false.
var ENABLED = true;

/*
 * When running on simian or figaro, rosetta is run under user "phet-admin". However, "process.env.HOME" will get
 * the user who is starting the process's home directory, not phet-admin's home directory, therefore we need to use
 * a different approach to get the home directory.
 */
if ( !/^win/.test( process.platform ) ) {
  var passwdUser = require( 'passwd-user' );
  PREFERENCES_FILE = passwdUser.sync( process.getuid() ).homedir + '/.phet/build-local.json';
}
else {
  PREFERENCES_FILE = process.env.HOME + '/.phet/build-local.json';
}

// ensure that the preferences file exists and has the required fields
assert( fs.existsSync( PREFERENCES_FILE ), 'missing preferences file ' + PREFERENCES_FILE );
var preferences = require( PREFERENCES_FILE );
assert( preferences.githubUsername, 'githubUsername is missing from ' + PREFERENCES_FILE );
assert( preferences.githubPassword, 'githubPassword is missing from ' + PREFERENCES_FILE );
assert( preferences.buildServerAuthorizationCode, 'buildServerAuthorizationCode is missing from ' + PREFERENCES_FILE );
assert( preferences.rosettaSessionSecret, 'rosettaSessionSecret is missing from ' + PREFERENCES_FILE +
                                          '. To set this up for local testing add any string as the value for "rosettaSessionSecret"' );
assert( preferences.htmlSimsDirectory, 'Missing htmlSimsDirectory from ' + PREFERENCES_FILE );

preferences.productionServerURL = preferences.productionServerURL || 'https://phet.colorado.edu';
preferences.productionServerName = preferences.productionServerName || 'figaro.colorado.edu';

/*
 * Add "babelBranch": "tests" in build-local.json for rosetta testing, so that commits will change the 'tests' branch
 * of babel instead of master. Make sure to checkout the tests branch in babel on the server as well.
 */
preferences.babelBranch = preferences.babelBranch || 'master';

assert( preferences.babelBranch === 'master' || preferences.babelBranch === 'tests', 'BRANCH must be set to either master or tests' );

// initialize globals
global.preferences = preferences;

// must be required after global.preferences has been initialized
var routes = require( __dirname + '/js/routes' );

// configure postgres connection
if ( preferences.pgConnectionString ) {
  query.connectionParameters = preferences.pgConnectionString;
}
else {
  query.connectionParameters = 'postgresql://localhost/rosetta';
}

// Handle command line input
// First 2 args provide info about executables, ignore
var commandLineArgs = process.argv.slice( 2 );

var parsedCommandLineOptions = parseArgs( commandLineArgs, {
  boolean: true
} );

var defaultOptions = {

  // options for supporting help, currently no other options are supported, but this might change
  help: false,
  h: false
};

for ( var key in parsedCommandLineOptions ) {
  if ( key !== '_' && parsedCommandLineOptions.hasOwnProperty( key ) && !defaultOptions.hasOwnProperty( key ) ) {
    console.log( 'Unrecognized option: ' + key );
    console.log( 'try --help for usage information.' );
    return;
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
winston.add( winston.transports.Console, { 'timestamp': function(){
  var now = new Date();
  return dateformat( now, 'mmm dd yyyy HH:MM:ss Z' );
} } );

// log startup message
winston.log( 'info', '---- rosetta starting up, about to create ExpressJS app ----' );

// Create and configure the ExpressJS app
var app = express();
app.set( 'views', __dirname + '/html/views' );
app.set( 'view engine', 'dot' );
app.engine( 'html', doT.__express );

// set static directories for css, img, and js
app.use( '/translate/css', express.static( __dirname + '/public/css' ) );
app.use( '/translate/img', express.static( __dirname + '/public/img' ) );
app.use( '/translate/js', express.static( __dirname + '/public/js' ) );

// need cookieParser middleware before we can do anything with cookies
app.use( express.cookieParser() );
app.use( express.session( { secret: preferences.rosettaSessionSecret } ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );

//----------------------------------------------------------------------------
// Set up the routes.  The order matters.
//----------------------------------------------------------------------------

// route for showing 'down for maintenance' page when needed
if ( !ENABLED ){
  app.get( '/translate*', routes.showOffLinePage );
}

// route that checks whether the user is logged in
app.get( '/translate*', routes.checkForValidSession );

// landing page for the translation utility
app.get( '/translate', routes.chooseSimulationAndLanguage );

// route for translating a specific sim to a specific language
app.get( '/translate/sim/:simName?/:targetLocale?', routes.translateSimulation );
app.post( '/translate/sim/save/:simName?/:targetLocale?', routes.saveStrings );
app.post( '/translate/sim/:simName?/:targetLocale?', routes.submitStrings );

// route for extracting strings from a sim
app.get( '/translate/extractStrings', routes.extractStringsAPI );

app.get( '/translate/logout', routes.logout );

// fall through route
app.get( '/*', routes.pageNotFound );

// start the server
app.listen( LISTEN_PORT, function() { winston.log( 'info', 'Listening on port ' + LISTEN_PORT ); } );
