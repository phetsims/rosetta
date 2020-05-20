// Copyright 2002-2020, University of Colorado Boulder

/**
 * // TODO: Reword this maybe when you're done? It should be the same, but you might want to reword.
 * Read configuration information from the file system, using defaults for non-required values and throwing assertions
 * if required information is missing, and return an object that contains the resulting configuration.
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
 * @returns {string} - directory in which Rosetta's configuration resides
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
    // Liam: I'm wondering if this is still necessary or if there's a way I can make this more elegant.
    // Liam: Perhaps test this out on macOS and/or Linux. Maybe you can figure something out that way.
    // Liam: It would be really nice if this function didn't have to exist. Then you could just set a constant.
    configDirPath = passwdUser.sync( process.getuid() ).homedir + UNIX_CONFIG_DIR + '/';
  }
  return configDirPath;
}

/**
 * If the config file exists, read it, parse it, and return it.
 * @param {string} configPathWithFilename - full path with filename to Rosetta config
 * @returns {Object} config - parsed JSON config for Rosetta
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
    assert(`Config file not found in ${configPathWithFilename}.`);
  }
}

/**
 * Assert that each necessary value in the config file exists.
 * @param {Object} config - parsed JSON config for Rosetta
 * @param {string} configPathWithFilename - full path with filename to Rosetta config
 */
function assertConfigValuesExist( config, configPathWithFilename ) {

  // The GitHub credentials for phet-dev must exist.
  assert( config.githubUsername, `githubUsername is missing from ${configPathWithFilename}.` );
  assert( config.githubPassword, `githubPassword is missing from ${configPathWithFilename}.` );

  // The credentials for build requests and metadata retrieval must exist.
  assert( config.buildServerAuthorizationCode, `buildServerAuthorizationCode is missing from ${configPathWithFilename}.` );
  assert( config.serverToken, `serverToken is missing from ${configPathWithFilename}.` );

  // The items for connecting to the short-term-string-storage database must exist.
  assert( config.stringStorageDbHost, `stringStorageDbHost is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbPort, `stringStorageDbPort is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbName, `stringStorageDbName is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbUser, `stringStorageDbUser is missing from ${configPathWithFilename}.` );
  assert( config.stringStorageDbPass, `stringStorageDbPass is missing from ${configPathWithFilename}.` );
}

// TODO: Convert the string concatenation to ES6 if possible.
// TODO: Add proper capitalization to asserts.
// TODO: Break this up.
// TODO: Use new export! See https://github.com/phetsims/phet-info/blob/master/doc/best-practices-for-modules.md#do-not-.
// TODO: I think the only thing used from this is the config (big if true), so just export that.
/**
 * TODO: Hmm... How to describe this function?
 * @returns {string} - runtime configuration for Rosetta
 */
module.exports = function() {

  const configDirPath = getConfigDirPath();
  const configPathWithFilename = configDirPath + CONFIG_FILENAME;

  winston.info( `Your platform is ${process.platform}.` );
  winston.info( `Config should be ${configPathWithFilename}.` );

  // TODO: Test this out.
  let config = readAndParseConfig( configPathWithFilename );

  assertConfigValuesExist(config, configPathWithFilename);

  //  config = setDefaultConfigValues(config);

  // The "production server" is the server from which sims and sim metadata are retrieved as well as the place where
  // build requests are sent once a new translation has been submitted. Default to the main server if no value is
  // provided.
  config.productionServerURL = config.productionServerURL || 'https://phet.colorado.edu';

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
    'rosettaSessionSecret is missing from ' + configPathWithFilename +
    '. To set this up for local testing add any string as the value for "rosettaSessionSecret"'
  );

  // Set up the environment variables used by the 'pg' module to interact with the DB used for short-term string
  // storage. I (jbphet) had never encountered this sort of approach before, where the configuration information is
  // stored in process variables, but that's what was done in the example code, and apparently this is fairly common in
  // apps the interface to databases. So, when in Rome...
  process.env = Object.assign( process.env, {
    PGUSER: config.stringStorageDbUser,
    PGHOST: config.stringStorageDbHost,
    PGPASSWORD: config.stringStorageDbPass,
    PGDATABASE: config.stringStorageDbName,
    PGPORT: config.stringStorageDbPort
  } );

  // set the logging level, use the 'info' level if no value is provided
  config.loggingLevel = config.loggingLevel || 'info';

  // Set the branch of babel where translations will be stored and from whence they will be retrieved.  The value
  // "master" is the default if nothing is explicitly specified. The branch "tests" can be specified to enable testing
  // that doesn't affect existing translations.
  config.babelBranch = config.babelBranch || 'master';

  assert(
    config.babelBranch === 'master' || config.babelBranch === 'tests',
    'babelBranch must be set to either master or tests'
  );

  // It is sometimes desirable when debugging to turn off all commits of translated strings to GitHub, especially if a
  // lot of testing is being done and having all the resulting commits in GitHub would be more distracting than truly
  // valuable. This configuration parameter allows string commits to be skipped, and the information about them will
  // just be logged instead.
  config.performStringCommits = config.performStringCommits === undefined ? true : config.performStringCommits;

  // It is sometimes desirable when debugging to turn off the build requests that are sent to the build server when a
  // translation is successfully submitted. This configuration parameter can be used to tell the code to skip sending
  // the build requests.
  config.sendBuildRequests = config.sendBuildRequests === undefined ? true : config.sendBuildRequests;

  // log a warning if Rosetta is disabled
  if ( !config.enabled ) {
    winston.warn( 'the translation utility is disabled, no interaction will be possible' );
  }

  return config;
};
