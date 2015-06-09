// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for PhET translation web app.  This is where ExpressJS gets configured and the routes are set up.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

/* jslint node: true */
'use strict';

// modules
var express = require( 'express' );
var doT = require( 'express-dot' );
var routes = require( __dirname + '/js/routes' );
var parseArgs = require( 'minimist' );
var winston = require( 'winston' );
var bodyParser = require( 'body-parser' );
var _ = require( 'underscore' );

// constants
var LISTEN_PORT = 16372;

// Handle command line input
// First 2 args provide info about executables, ignore
var commandLineArgs = process.argv.slice( 2 );

var parsedCommandLineOptions = parseArgs( commandLineArgs, {
  boolean: true
} );

var defaultOptions = {
  logFile: undefined,
  silent: false,

  // options for supporting help
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
    '    type: bool  default: false\n' +
    '  --logFile (file name)\n' +
    '    type: string  default: undefined\n' +
    '  --silent (do not log to console)\n' +
    '    type: bool  default: false\n'
  );
  console.log(
    'Example - Run Rosetta without console output, but log to a file called log.txt:\n' +
    '  node rosetta.js --silent --logFile=log.txt\n'
  );
  return;
}

// Merge the default and supplied options.
var options = _.extend( defaultOptions, parsedCommandLineOptions );

if ( options.logFile ) {
  winston.add( winston.transports.File, { filename: options.logFile } );
}
if ( options.silent ) {
  winston.remove( winston.transports.Console );
}

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
app.use( express.session( { secret: '1234567890QWERTY' } ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded() );

//----------------------------------------------------------------------------
// Set up the routes.  The order matters.
//----------------------------------------------------------------------------

// route that checks whether the user is logged in
app.get( '/translate/*', routes.checkForValidSession );

// landing page for the translation utility
app.get( '/translate/', routes.chooseSimulationAndLanguage );

// route for translating a specific sim to a specific language
app.get( '/translate/sim/:simName?/:targetLocale?', routes.translateSimulation );
app.post( '/translate/sim/:simName?/:targetLocale?', routes.saveStrings );
app.post( '/translate/sim/:simName?/:targetLocale?', routes.submitStrings );

// route for extracting strings from a sim
app.get( '/translate/extractStrings', routes.extractStringsAPI );

// fall through route
app.get( '/*', routes.pageNotFound );

// start the server
app.listen( LISTEN_PORT, function() { winston.log( 'info', 'Listening on port ' + LISTEN_PORT ) } );
