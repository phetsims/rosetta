// Copyright 2018, University of Colorado Boulder

/**
 * Compile and validate a preferences object to be used throughout the app.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* eslint-env node */
'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );

module.exports = function() {

  let PREFERENCES_FILE;

  /**
   * Rosetta is run under user "phet-admin" on the dev and production servers. However, "process.env.HOME" will get
   * the home directory of the user who is starting the process, not phet-admin's home directory, therefore we need to use
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

  /*
   * Add "babelBranch": "tests" in build-local.json for rosetta testing, so that commits will change the 'tests' branch
   * of babel instead of master. Make sure to checkout the tests branch in babel on the server as well.
   */
  preferences.babelBranch = preferences.babelBranch || 'master';

  assert( preferences.babelBranch === 'master' || preferences.babelBranch === 'tests', 'BRANCH must be set to either master or tests' );

// initialize globals
  global.preferences = preferences;

};