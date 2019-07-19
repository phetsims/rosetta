// Copyright 2018-2019, University of Colorado Boulder

/**
 * Compile and validate a preferences object to be used throughout the app.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );
const { Client } = require( 'pg' ); //eslint-disable-line
const winston = require( 'winston' );

module.exports = async function() {

  let PREFERENCES_FILE;

  /**
   * Rosetta is run under user "phet-admin" on the dev and production servers. However, "process.env.HOME" will get the
   * home directory of the user who is starting the process, not phet-admin's home directory, therefore we need to use
   * the following approach to get the home directory.
   */
  if ( !/^win/.test( process.platform ) ) {
    const passwdUser = require( 'passwd-user' ); // eslint-disable-line require-statement-match
    PREFERENCES_FILE = passwdUser.sync( process.getuid() ).homedir + '/.phet/build-local.json';
  }
  else {
    PREFERENCES_FILE = process.env.HOME + '/.phet/build-local.json';
  }

  winston.log( 'info', 'obtaining configuration information from ' + PREFERENCES_FILE );

  // ensure that the preferences file exists and has the required fields
  assert( fs.existsSync( PREFERENCES_FILE ), 'missing preferences file ' + PREFERENCES_FILE );
  const preferences = require( PREFERENCES_FILE );
  assert( preferences.githubUsername, 'githubUsername is missing from ' + PREFERENCES_FILE );
  assert( preferences.githubPassword, 'githubPassword is missing from ' + PREFERENCES_FILE );
  assert( preferences.buildServerAuthorizationCode, 'buildServerAuthorizationCode is missing from ' + PREFERENCES_FILE );
  assert( preferences.serverToken, 'serverToken is missing from ' + PREFERENCES_FILE );
  assert( preferences.rosettaSessionSecret, 'rosettaSessionSecret is missing from ' + PREFERENCES_FILE +
                                            '. To set this up for local testing add any string as the value for "rosettaSessionSecret"' );

  preferences.productionServerURL = preferences.productionServerURL || 'https://phet.colorado.edu';
  preferences.productionServerName = preferences.productionServerName || 'phet-server.int.colorado.edu';

  // verify that the information necessary for connecting to the short-term-string-storage database is available
  assert( preferences.rosettaDbHost, `rosettaDbHost is missing from ${PREFERENCES_FILE}` );
  assert( preferences.rosettaDbPort, `rosettaDbPort is missing from ${PREFERENCES_FILE}` );
  assert( preferences.rosettaDbName, `rosettaDbName is missing from ${PREFERENCES_FILE}` );
  assert( preferences.rosettaDbUser, `rosettaDbUser is missing from ${PREFERENCES_FILE}` );
  assert( preferences.rosettaDbPass, `rosettaDbPass is missing from ${PREFERENCES_FILE}` );

  // set up the environment variables used by the 'pg' module to interact with the DB
  process.env = Object.assign( process.env, {
    PGUSER: preferences.rosettaDbUser,
    PGHOST: preferences.rosettaDbHost,
    PGPASSWORD: preferences.rosettaDbPass,
    PGDATABASE: preferences.rosettaDbName,
    PGPORT: preferences.rosettaDbPort
  } );

  // check that the DB server is running and that a connection can be successfully established
  winston.log( 'info', 'testing database connection' );
  const client = new Client();
  try {
    await client.connect();
    winston.log( 'info', 'successfully connected to the database, trying a query...' );
    const res = await client.query( 'SELECT NOW()' );
    // TODO: Figure out what to put here when the connection is succeeding
    winston.log( 'res = ' + JSON.stringify( res ) );
  }
  catch( err ) {
    winston.log( 'warn', 'error connecting to the database server, short term string storage will not work, err = ' + err );
  }

  /*
   * Add "babelBranch": "tests" in build-local.json for rosetta testing, so that commits will change the 'tests' branch
   * of babel instead of master. Make sure to checkout the tests branch in babel on the server as well.
   */
  preferences.babelBranch = preferences.babelBranch || 'master';

  assert( preferences.babelBranch === 'master' || preferences.babelBranch === 'tests', 'BRANCH must be set to either master or tests' );

// initialize globals
  global.preferences = preferences;

};