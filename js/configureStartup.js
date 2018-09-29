// Copyright 2018, University of Colorado Boulder

/**
 * Code that runs necessary configuration for the rosetta app to be set up.
 * This will:
 *    configure the logger
 *    configure the postgres connection
 *
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const childProcess = require( 'child_process' ); // eslint-disable-line require-statement-match
const configurePreferences = require( './configurePreferences' );
const dateformat = require( 'dateformat' );
const parseArgs = require( 'minimist' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );


module.exports = function() {

  // Assign preferences to a global, after validation that proper credentials have been supplied.
  configurePreferences();

  // add a global handler for unhandled promise rejections
  process.on( 'unhandledRejection', error => {

    // generally, this shouldn't happen, so if these are in the log they should be tracked down and fixed
    winston.log( 'error', 'unhandled rejection, error.message =', error.message );
  } );

  // configure the logger
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

  // log the SHA of rosetta - this may make it easier to duplicate and track down problems
  childProcess.exec( 'git rev-parse HEAD', function( err, stdout ) {
    if ( !err ) {
      winston.info( 'current SHA: ', stdout );
    }
    else {
      winston.warn( 'not running from a git repo, unable to log SHA' );
    }
  } );

  if ( process.env.ENV === 'dev' ) {
    debugger;
    process.env = { ...process.env, ...global.preferences.devDbOptions };
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

  // command line arg validation
  for ( const key in parsedCommandLineOptions ) {
    if ( key !== '_' && parsedCommandLineOptions.hasOwnProperty( key ) && !defaultOptions.hasOwnProperty( key ) ) {
      console.log( 'Unrecognized option: ' + key );
      console.log( 'try --help for usage information.' );
      process.exit();
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
    process.exit();
  }

};