// Copyright 2018, University of Colorado Boulder

/**
 * Compile and validate a preferences object to be used throughout the app.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );
const { Client } = require( 'pg' ); //eslint-disable-line

module.exports = function() {

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

  // if we're in a development environment
  // TODO: This if clause can probably be removed
  if ( process.env.ENV === 'dev' ) {
    // assert appropriate params are set in build-local.json
    assert( preferences.rosettaDevDbHost, `rosettaDevDbHost is missing from ${PREFERENCES_FILE}` );
    assert( preferences.rosettaDevDbPort, `rosettaDevDbPort is missing from ${PREFERENCES_FILE}` );
    assert( preferences.rosettaDevDbName, `rosettaDevDbName is missing from ${PREFERENCES_FILE}` );
    assert( preferences.rosettaDevDbUser, `rosettaDevDbUser is missing from ${PREFERENCES_FILE}` );
    assert( preferences.rosettaDevDbPass, `rosettaDevDbPass is missing from ${PREFERENCES_FILE}` );

    // 'pg' module uses env variables to establish the db connection
    process.env = Object.assign( process.env, {
      PGUSER: preferences.rosettaDevDbUser,
      PGHOST: preferences.rosettaDevDbHost,
      PGPASSWORD: preferences.rosettaDevDbPass,
      PGDATABASE: preferences.rosettaDevDbName,
      PGPORT: preferences.rosettaDevDbPort
    } );

    // assert that the server is running and that there is a successful database connection
    const client = new Client();
    client.connect().catch( () => {
      assert( false, 'There was an error connecting to the dev server' );
    } )
      .then( () => client.query( 'SELECT NOW()' ) )
      .catch( () => {
        assert( false, 'There was an error connection to the database' );
      } )
      .then( () => { client.end(); } );
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