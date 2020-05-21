// Copyright 2002-2020, University of Colorado Boulder

/**
 * If Rosetta's configuration file exists, read it and parse it. Assert that necessary values exist. Set default values
 * if they haven't been set. Set variables used by the "pg" module (the short-term storage PostgreSQL database).
 * Finally, return the resulting configuration as an object.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

'use strict';

// Modules
const _ = require( 'lodash' ); // eslint-disable-line
const assert = require( 'assert' );
const fs = require( 'fs' );
const passwdUser = require( 'passwd-user' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );

// Constants
const UNIX_CONFIG_DIR = '/.phet';
const WINDOWS_CONFIG_DIR = '\\.phet';
const CONFIG_FILENAME = 'rosetta-config.json';

/**
 * Get Rosetta's configuration directory path depending on platform (Windows or UNIX).
 * @returns {string} - The directory in which Rosetta's configuration resides.
 */
function getConfigDirPath() {
  let configDirPath;
  const platformIsWindows = process.platform === 'win32' ? true : false;
  if ( platformIsWindows ) {
    configDirPath = process.env.HOME + WINDOWS_CONFIG_DIR + '\\';
  }
  else {

    // The following somewhat odd-looking code gets the config file from the home directory when running under a
    // UNIX variant. This was necessary because Rosetta is generally run under phet-admin, but "process.env.HOME" was
    // returning the home directory of the user who is starting the process, not phet-admin's home directory.
    configDirPath = passwdUser.sync( process.getuid() ).homedir + UNIX_CONFIG_DIR + '/';
  }
  return configDirPath;
}

/**
 * If the configuration file exists, read it, parse it, and return it. Otherwise, assert that it exists.
 * @param {string} configPathWithFilename - The full path with filename for Rosetta configuration.
 * @returns {Object} config - The parsed JSON configuration for Rosetta.
 */
function readAndParseConfig( configPathWithFilename ) {
  const configExists = fs.existsSync( configPathWithFilename );
  let configJSON;
  let config;
  if ( configExists ) {
    configJSON = fs.readFileSync( configPathWithFilename );
    config = JSON.parse( configJSON );
    return config;
  }
  else {
    assert( `Config file not found in ${configPathWithFilename}.` );
  }
}

/**
 * Assert that each necessary value in the configuration file exists.
 * @param {Object} config - The parsed JSON configuration for Rosetta.
 * @param {string} configPathWithFilename - The full path with filename for Rosetta configuration.
 */
function assertConfigValuesExist( config, configPathWithFilename ) {

  // The GitHub credentials for phet-dev must exist.
  assert( config.githubUsername, `githubUsername is missing from ${configPathWithFilename}.` );
  assert( config.githubPassword, `githubPassword is missing from ${configPathWithFilename}.` );

  // The credentials for build requests and metadata retrieval must exist.
  assert(
    config.buildServerAuthorizationCode,
    `buildServerAuthorizationCode is missing from ${configPathWithFilename}.`
  );
  assert( config.serverToken, `serverToken is missing from ${configPathWithFilename}.` );

  // The items for connecting to the short-term-string-storage database must exist.
  assert( config.stringStorageDbHost, `stringStorageDbHost is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbPort, `stringStorageDbPort is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbName, `stringStorageDbName is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbUser, `stringStorageDbUser is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbPass, `stringStorageDbPass is missing from ${configPathWithFilename}.` );

  // The Rosetta session secret must exist, but for local testing it can be a dummy string.
  assert(
    config.rosettaSessionSecret,
    `rosettaSessionSecret is missing from ${configPathWithFilename}. For local testing, simply supply a dummy string.`
  );

  // Babel has only two branches: (1) "master" and (2) "tests".
  assert(
    config.babelBranch === 'master' || config.babelBranch === 'tests',
    'babelBranch must be either "master" or "tests".'
  );
}

/**
 * Set default Rosetta configuration values if they haven't been set.
 * @param config {Object} - The parsed JSON configuration for Rosetta.
 */
function setDefaultConfigValues( config ) {

  // The "production server" is the server from which sims and sim metadata are retrieved as well as the place where
  // build requests are sent once a new translation has been submitted. Default to PhET Server.
  config.productionServerURL = config.productionServerURL || 'https://phet.colorado.edu';

  // The enabled field isn't required in the config file, and its default value is true. It can be set to false
  // to put up a "translation not available" message.
  if ( config.enabled === undefined ) {
    config.enabled = true;
  }
  else {
    assert( typeof config.enabled === 'boolean', 'enabled must be a boolean if defined.' );
  }

  // Set the logging level. Default is 'info' level. Set to debug for testing.
  config.loggingLevel = config.loggingLevel || 'info';

  // Set Babel branch where Rosetta stores and retrieves translations. The default branch is "master."
  // Use the "tests" branch of Babel to test without affecting existing translations.
  config.babelBranch = config.babelBranch || 'master';

  // If, for testing purposes, you want to turn off all commits of translated strings GitHub, you can set
  // performStringCommits to false. (Lots of translated string commits are usually more distracting than useful.) If
  // set to false, the information about the translated string commits will be logged instead.
  config.performStringCommits = config.performStringCommits === undefined ? true : config.performStringCommits;

  // When debugging, it's sometimes desirable to turn off build requests that are sent to the build server when a
  // translation is successfully submitted. This configuration parameter can be used to tell the code to skip sending
  // the build requests.
  config.sendBuildRequests = config.sendBuildRequests === undefined ? true : config.sendBuildRequests;
}

/**
 * Set variables used by the "pg" module (short-term string storage PostgreSQL database).
 * @param {Object} config - The parsed JSON configuration for Rosetta.
 */
function setPostgresVariables( config ) {
  process.env = Object.assign( process.env, {
    PGUSER: config.stringStorageDbUser,
    PGHOST: config.stringStorageDbHost,
    PGPASSWORD: config.stringStorageDbPass,
    PGDATABASE: config.stringStorageDbName,
    PGPORT: config.stringStorageDbPort
  } );
}

/**
 * Driver code for getting Rosetta configuration.
 * @returns {Object} - The parsed JSON configuration for Rosetta that has necessary values.
 */
function getRosettaConfig() {

  const configDirPath = getConfigDirPath();
  const configPathWithFilename = configDirPath + CONFIG_FILENAME;

  winston.info( `Your platform is ${process.platform}.` );
  winston.info( `Config should be ${configPathWithFilename}.` );

  let config = readAndParseConfig( configPathWithFilename );

  assertConfigValuesExist( config, configPathWithFilename );

  setDefaultConfigValues( config );

  setPostgresVariables( config );

  if ( !config.enabled ) {
    winston.warn( 'The translation utility is disabled, no interaction will be possible.' );
  }

  return config;
}

module.exports = getRosettaConfig;