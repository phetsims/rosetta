// Copyright 2018-2019, University of Colorado Boulder

/**
 * Interpret and validate a preferences object that will be used throughout the app.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

'use strict';

// modules
const assert = require( 'assert' );
const { Client } = require( 'pg' ); //eslint-disable-line
const fs = require( 'fs' );
const passwdUser = require( 'passwd-user' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );

// constants
const PREFERENCES_FILE_PATH_FROM_DIR = '/.phet/build-local.json';

module.exports = async function() {

  /**
   * Locate and read the preferences file.
   */
  let preferencesFileName;
  const platform = process.platform;
  winston.log( 'info', 'platform = ' + platform );
  if ( platform.indexOf( 'win' ) === 0 ) {

    // windows
    preferencesFileName = process.env.HOME + PREFERENCES_FILE_PATH_FROM_DIR;
  }
  else {

    // The following somewhat odd looking code gets the preferences file from the home directory when running under a
    // Unix variant.  This was necessary because rosetta is generally run under phet-admin, but "process.env.HOME" was
    // returning the home directory of the user who is starting the process, not phet-admin's home directory.
    preferencesFileName = passwdUser.sync( process.getuid() ).homedir + PREFERENCES_FILE_PATH_FROM_DIR;
  }

  winston.log( 'info', 'preferences file full path and name: ' + preferencesFileName );

  // ensure that the preferences file exists
  assert( fs.existsSync( preferencesFileName ), 'preferences file not found: ' + preferencesFileName );

  // read the preferences file and verify that the needed information is present
  const preferencesJSON = fs.readFileSync( preferencesFileName );
  const preferences = JSON.parse( preferencesJSON );
  assert( preferences.githubUsername, 'githubUsername is missing from ' + preferencesFileName );
  assert( preferences.githubPassword, 'githubPassword is missing from ' + preferencesFileName );
  assert( preferences.buildServerAuthorizationCode, 'buildServerAuthorizationCode is missing from ' + preferencesFileName );
  assert( preferences.serverToken, 'serverToken is missing from ' + preferencesFileName );
  assert( preferences.rosettaSessionSecret, 'rosettaSessionSecret is missing from ' + preferencesFileName +
                                            '. To set this up for local testing add any string as the value for "rosettaSessionSecret"' );

  // verify that the information necessary for connecting to the short-term-string-storage database is available
  assert( preferences.rosettaDbHost, `rosettaDbHost is missing from ${preferencesFileName}` );
  assert( preferences.rosettaDbPort, `rosettaDbPort is missing from ${preferencesFileName}` );
  assert( preferences.rosettaDbName, `rosettaDbName is missing from ${preferencesFileName}` );
  assert( preferences.rosettaDbUser, `rosettaDbUser is missing from ${preferencesFileName}` );
  assert( preferences.rosettaDbPass, `rosettaDbPass is missing from ${preferencesFileName}` );

  // set up the environment variables used by the 'pg' module to interact with the DB used for short-term string storage
  process.env = Object.assign( process.env, {
    PGUSER: preferences.rosettaDbUser,
    PGHOST: preferences.rosettaDbHost,
    PGPASSWORD: preferences.rosettaDbPass,
    PGDATABASE: preferences.rosettaDbName,
    PGPORT: preferences.rosettaDbPort
  } );

  // get information on the server or use defaults
  preferences.productionServerURL = preferences.productionServerURL || 'https://phet.colorado.edu';
  preferences.productionServerName = preferences.productionServerName || 'phet-server.int.colorado.edu';

  // check that the DB server is running and that a connection can be successfully established
  winston.log( 'info', 'testing database connection...' );
  const client = new Client();
  client.connect();
  client.query( 'SELECT NOW()', ( err, res ) => {
    console.log( err, res )
    client.end()
  } );

  // try {
  //   await client.connect();
  //   winston.log( 'info', 'successfully connected to the database, trying a query...' );
  //   const res = await client.query( 'SELECT NOW()' );
  //   // TODO: Figure out what to put here when the connection is succeeding
  //   winston.log( 'res = ' + JSON.stringify( res ) );
  // }
  // catch( err ) {
  //   winston.log( 'warn', 'error connecting to the database server, short term string storage will not work, err = ' + err );
  // }

  /*
   * Add "babelBranch": "tests" in build-local.json for rosetta testing, so that commits will change the 'tests' branch
   * of babel instead of master. Make sure to checkout the tests branch in babel on the server as well.
   */
  preferences.babelBranch = preferences.babelBranch || 'master';

  assert( preferences.babelBranch === 'master' || preferences.babelBranch === 'tests', 'BRANCH must be set to either master or tests' );

// initialize globals
  global.preferences = preferences;

};