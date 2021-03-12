// Copyright 2019-2020, University of Colorado Boulder

/**
 * TODO: Relocate code in this file that doesn't have to do with getting the Rosetta configuration file. See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
 * If Rosetta's configuration file exists, read it and parse it. Assert that necessary values exist. Set default values
 * if they haven't been set. Set variables used by the pg module (the short-term storage PostgreSQL database).
 * Finally, return the resulting configuration as an object.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

'use strict';

// modules
const assert = require( 'assert' );
const fs = require( 'fs' );
const passwdUser = require( 'passwd-user' ); // eslint-disable-line require-statement-match
const winston = require( 'winston' );

// constants
const UNIX_CONFIG_DIR = '/.phet';
const WINDOWS_CONFIG_DIR = '\\.phet';
const CONFIG_FILENAME = 'rosetta-config.json';

/**
 * Get Rosetta's configuration directory path depending on platform (Windows or UNIX).
 *
 * @returns {string} configDirPath - the directory in which Rosetta's configuration resides
 */
function getConfigDirPath() {
  let configDirPath;
  const platformIsWindows = process.platform === 'win32';
  if ( platformIsWindows ) {
    configDirPath = `${process.env.HOME + WINDOWS_CONFIG_DIR}\\`;
  }
  else {

    // The following somewhat odd-looking code gets the config file from the home directory when running under a
    // UNIX variant. This was necessary because Rosetta is generally run under phet-admin, but process.env.HOME was
    // returning the home directory of the user who is starting the process, not phet-admin's home directory.
    configDirPath = `${passwdUser.sync( process.getuid() ).homedir + UNIX_CONFIG_DIR}/`;
  }
  return configDirPath;
}

/**
 * If the configuration file exists, read it, parse it, and return it. Otherwise, assert that it exists.
 *
 * @param {string} configPathWithFilename - the full path with filename for Rosetta configuration
 * @returns {Object} config - the JSON object configuration for Rosetta
 */
function readAndParseConfig( configPathWithFilename ) {
  const configExists = fs.existsSync( configPathWithFilename );
  let configJson = '';
  let configObject = {};
  if ( configExists ) {
    configJson = fs.readFileSync( configPathWithFilename );
    configObject = JSON.parse( configJson );
    return configObject;
  }
  else {
    assert( `Config file not found in ${configPathWithFilename}` );
  }
}

/**
 * Assert that each necessary value in the configuration file exists.
 *
 * @param {Object} configObject - the JSON object configuration for Rosetta
 * @param {string} configPathWithFilename - the full path with filename for Rosetta configuration
 */
function assertConfigValuesExist( configObject, configPathWithFilename ) {

  // The GitHub personal access token for the PhET GitHub machine account (phet-dev) must exist.
  assert( configObject.githubPersonalAccessToken, `githubPersonalAccessToken is missing from ${configPathWithFilename}` );

  // The credentials for build requests and metadata retrieval must exist.
  assert(
    configObject.buildServerAuthorizationCode,
    `buildServerAuthorizationCode is missing from ${configPathWithFilename}`
  );
  assert( configObject.serverToken, `serverToken is missing from ${configPathWithFilename}` );

  // The items for connecting to the short-term-string-storage database must exist.
  assert( configObject.stringStorageDbHost, `stringStorageDbHost is missing from ${configPathWithFilename}` );
  assert( configObject.stringStorageDbPort, `stringStorageDbPort is missing from ${configPathWithFilename}` );
  assert( configObject.stringStorageDbName, `stringStorageDbName is missing from ${configPathWithFilename}` );
  assert( configObject.stringStorageDbUser, `stringStorageDbUser is missing from ${configPathWithFilename}` );
  assert( configObject.stringStorageDbPass, `stringStorageDbPass is missing from ${configPathWithFilename}` );

  // The Rosetta session secret must exist, but for local testing it can be a dummy string.
  assert(
    configObject.rosettaSessionSecret,
    `rosettaSessionSecret is missing from ${configPathWithFilename}. For local testing, simply supply a dummy string`
  );

  // Babel should have only two branches: master and tests.
  assert(
    configObject.babelBranch === 'master' || configObject.babelBranch === 'tests',
    'babelBranch must be either master or tests'
  );
}

/**
 * Set default Rosetta configuration values if they haven't been set.
 *
 * @param {Object} configObject - the JSON object configuration for Rosetta
 */
function setDefaultConfigValues( configObject ) {

  // The production server is the server from which sims and sim metadata are retrieved as well as the place where
  // build requests are sent once a new translation has been submitted. Default to PhET Server.
  configObject.productionServerURL = configObject.productionServerURL || 'https://phet.colorado.edu';

  // The enabled field isn't required in the config file, and its default value is true. It can be set to false
  // to put up a "translation not available" message.
  if ( configObject.enabled === undefined ) {
    configObject.enabled = true;
  }
  else {
    assert( typeof configObject.enabled === 'boolean', 'enabled must be a boolean if defined' );
  }

  // Set the logging level. The default is the info level. Set this to debug for testing.
  configObject.loggingLevel = configObject.loggingLevel || 'info';

  // Set Babel branch where Rosetta stores and retrieves translations. The default branch is master.
  // Use the tests branch of Babel to test without affecting existing translations.
  configObject.babelBranch = configObject.babelBranch || 'master';

  // If, for testing purposes, you want to turn off all commits of translated strings GitHub, you can set
  // performStringCommits to false. (Lots of translated string commits are usually more distracting than useful.) If
  // set to false, the information about the translated string commits will be logged instead.
  configObject.performStringCommits = configObject.performStringCommits === undefined ? true : configObject.performStringCommits;

  // When debugging, it's sometimes desirable to turn off build requests that are sent to the build server when a
  // translation is successfully submitted. This configuration parameter can be used to tell the code to skip sending
  // the build requests.
  configObject.sendBuildRequests = configObject.sendBuildRequests === undefined ? true : configObject.sendBuildRequests;
}

/**
 * // TODO: Put this function in a more appropriate file. See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
 * Set variables used by the pg module (the short-term string storage PostgreSQL database).
 *
 * @param {Object} configObject - the JSON object configuration for Rosetta
 */
function setPostgresVariables( configObject ) {
  process.env = Object.assign( process.env, {
    PGUSER: configObject.stringStorageDbUser,
    PGHOST: configObject.stringStorageDbHost,
    PGPASSWORD: configObject.stringStorageDbPass,
    PGDATABASE: configObject.stringStorageDbName,
    PGPORT: configObject.stringStorageDbPort
  } );
}

/**
 * Drive the Rosetta configuration and return the config as an object.
 *
 * @returns {Object} configObject - the JSON object configuration for Rosetta that has necessary values
 */
function getRosettaConfig() {

  // Create a variable for the config directory path.
  const CONFIG_DIR_PATH = getConfigDirPath();
  const CONFIG_PATH_WITH_FILENAME = CONFIG_DIR_PATH + CONFIG_FILENAME;

  // Log information about the platform and the config for the user.
  winston.info( `Your platform is ${process.platform}` );
  winston.info( `Config should be ${CONFIG_PATH_WITH_FILENAME}` );

  // Set the config and make sure it has what Rosetta needs to function.
  const configObject = readAndParseConfig( CONFIG_PATH_WITH_FILENAME );
  assertConfigValuesExist( configObject, CONFIG_PATH_WITH_FILENAME );
  setDefaultConfigValues( configObject );
  setPostgresVariables( configObject );

  // If the enabled flag is set to false, Rosetta is down. Otherwise, send the config.
  if ( !configObject.enabled ) {
    winston.warn( 'The translation utility is disabled, no interaction will be possible' );
  }
  return configObject;
}

module.exports = getRosettaConfig;