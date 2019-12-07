// Copyright 2018-2019, University of Colorado Boulder

/**
 * Read configuration information and create return an object that contains it.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

'use strict';

// modules
const _ = require( 'lodash' ); // eslint-disable-line
const assert = require( 'assert' );
const fs = require( 'fs' );
const passwdUser = require( 'passwd-user' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );

// constants
const CONFIG_DIR = '/.phet';
const COMMON_CONFIG_FILE_NAME = 'build-local.json';
const ROSETTA_CONFIG_FILE_NAME = 'rosetta-config.json';

module.exports = function() {

  // locate and read the config files
  const platform = process.platform;
  winston.info( 'platform = ' + platform );
  let configDirPath;
  if ( platform.indexOf( 'win' ) === 0 ) {

    // windows
    configDirPath = process.env.HOME + CONFIG_DIR + '/';
  }
  else {

    // The following somewhat odd looking code gets the config file from the home directory when running under a
    // Unix variant.  This was necessary because rosetta is generally run under phet-admin, but "process.env.HOME" was
    // returning the home directory of the user who is starting the process, not phet-admin's home directory.
    configDirPath = passwdUser.sync( process.getuid() ).homedir + CONFIG_DIR + '/';
  }
  const commonConfigFileName = configDirPath + COMMON_CONFIG_FILE_NAME;
  const rosettaConfigFileName = configDirPath + ROSETTA_CONFIG_FILE_NAME;

  winston.info( 'common config file full path and name: ' + commonConfigFileName );
  winston.info( 'rosetta-specific config file full path and name: ' + rosettaConfigFileName );

  // ensure that the config files exist
  assert( fs.existsSync( commonConfigFileName ), 'config file not found: ' + commonConfigFileName );
  assert( fs.existsSync( rosettaConfigFileName ), 'config file not found: ' + rosettaConfigFileName );

  // read the common config file and verify that the needed information is present
  const configJSON = fs.readFileSync( commonConfigFileName );
  const config = JSON.parse( configJSON );
  assert( config.githubUsername, 'githubUsername is missing from ' + commonConfigFileName );
  assert( config.githubPassword, 'githubPassword is missing from ' + commonConfigFileName );
  assert( config.buildServerAuthorizationCode, 'buildServerAuthorizationCode is missing from ' + commonConfigFileName );
  assert( config.serverToken, 'serverToken is missing from ' + commonConfigFileName );

  // use default server info if not supplied
  config.productionServerURL = config.productionServerURL || 'https://phet.colorado.edu';
  config.productionServerName = config.productionServerName || 'phet-server.int.colorado.edu';

  // read the rosetta-specific config file
  const rosettaSpecificConfigJSON = fs.readFileSync( rosettaConfigFileName );
  const rosettaSpecificConfig = JSON.parse( rosettaSpecificConfigJSON );

  // merge the rosetta-specific configuration fields with the common configuration field
  _.merge( config, rosettaSpecificConfig );

  // The enabled field isn't required in the config file, and its default value is true.  It can be set to 'false' in
  // the file in order to put up a sort of "Translation not available" message.
  if ( config.enabled === undefined ) {
    config.enabled = true;
  }
  else {
    assert( typeof config.enabled === 'boolean', 'enabled must be a boolean value if defined' );
  }

  assert(
    config.rosettaSessionSecret,
    'rosettaSessionSecret is missing from ' + rosettaConfigFileName +
    '. To set this up for local testing add any string as the value for "rosettaSessionSecret"'
  );

  // verify that the information necessary for connecting to the short-term-string-storage database is available
  assert( config.stringStorageDbHost, `stringStorageDbHost is missing from ${rosettaConfigFileName}` );
  assert( config.stringStorageDbPort, `stringStorageDbPort is missing from ${rosettaConfigFileName}` );
  assert( config.stringStorageDbName, `stringStorageDbName is missing from ${rosettaConfigFileName}` );
  assert( config.stringStorageDbUser, `stringStorageDbUser is missing from ${rosettaConfigFileName}` );
  assert( config.stringStorageDbPass, `stringStorageDbPass is missing from ${rosettaConfigFileName}` );

  // Set up the environment variables used by the 'pg' module to interact with the DB used for short-term string
  // storage.  I (jbphet) had never encountered this sort of approach before, where the configuration information is
  // stored in process variables, but that's what was done in the example code, and apparently this is fairly common in
  // apps the interface to databases.  So, when in Rome...
  process.env = Object.assign( process.env, {
    PGUSER: config.stringStorageDbUser,
    PGHOST: config.stringStorageDbHost,
    PGPASSWORD: config.stringStorageDbPass,
    PGDATABASE: config.stringStorageDbName,
    PGPORT: config.stringStorageDbPort
  } );

  // use the default logging level if none provided
  config.loggingLevel = config.loggingLevel || 'info';

  // Use the master branch if none is specified.  The branch "tests" can be specified to enable testing that doesn't
  // affect existing translations or create ones that will get published.
  config.babelBranch = config.babelBranch || 'master';

  assert(
    config.babelBranch === 'master' || config.babelBranch === 'tests',
    'babelBranch must be set to either master or tests'
  );

  // log a warning if Rosetta is disabled
  if ( !config.rosettaEnabled ) {
    winston.warn( 'the translation utility is disabled, no interaction will be possible' );
  }

  return config;
};