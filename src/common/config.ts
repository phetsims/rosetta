// Copyright 2022, University of Colorado Boulder

/**
 * This module gets the configuration for Rosetta from ~/.phet/rosetta-config.json.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export const pathToConfig = path.join( os.homedir(), '.phet', 'rosetta-config.json' );

// This type describes the structure of the configuration file.
export type PrivateConfigDataType = {

  // the branch of the phetsims/babel repo to use for long-term storage, useful for debugging
  readonly BABEL_BRANCH: string;

  // authentication token needed to request builds from the build server
  readonly BUILD_SERVER_AUTH: string;

  // the name to use for the short-term string storage database
  readonly DB_NAME: string;

  // the name of the collection (table) in the short-term string storage database
  readonly DB_SHORT_TERM_STORAGE_COLLECTION_NAME: string;

  // the URL of the short-term string storage database
  readonly DB_URI: string;

  // whether the short-term storage database is enabled
  readonly DB_ENABLED: boolean;

  // the environment in which Rosetta is running, e.g., 'development', 'staging', 'production'
  readonly ENVIRONMENT: string;

  // whether to use the real AI-enabled translation API or a mock one
  readonly FAKE_AUTOMATIC_TRANSLATION : boolean;

  // the Personal Access Token (PAT) for GitHub, used to authenticate requests to the GitHub API
  readonly GITHUB_PAT : string;

  // the URL of the GitHub repository where long-term storage is located
  readonly GITHUB_URL : string;

  // whether Rosetta is enabled, set to false at times when doing maintenance
  readonly IS_ENABLED : boolean;

  // the user ID used for development so that we don't have to log in
  readonly LOCAL_USER_ID: number;

  // Winston's logger severity level. We only use error, warn, verbose, and info.
  readonly LOGGER_LEVEL : string;

  // OpenRouter API key, used for automatic translation
  readonly OPENROUTER_API_KEY : string;

  // whether to perform string commits to long-term storage, which is GitHub as of this writing
  readonly PERFORM_STRING_COMMITS : boolean;

  // URL of the server where the phet-io sims are hosted
  readonly PHET_IO_SERVER_URL : string;

  // port number for the server portion of Rosetta
  readonly ROSETTA_PORT: number;

  // whether to send build requests to the build server - useful for testing without sending build requests
  readonly SEND_BUILD_REQUESTS : boolean;

  // the authorization token needed for metadata requests from the PhET server(s)
  readonly SERVER_TOKEN : string;

  // the URL of the PhET server where sims live, and where metadata requests and build server requests are sent
  readonly SERVER_URL : boolean;

  // whether to generate a short translation report, which is useful for debugging without hitting GitHub excessively
  readonly SHORT_REPORT : boolean;

  // the URL for signing out of the PhET website
  readonly SIGN_OUT_URL: string;

  // whether to expose a11y keys and thus allow them to be translated
  readonly TRANSLATE_A11Y : boolean;

  // the duration in milliseconds for which metadata is cached
  readonly VALID_METADATA_DURATION: number;

  // the duration in milliseconds for which cached locale info is valid
  readonly VALID_LOCALE_INFO_DURATION : number;

  // the URL for checking user data on the PhET website, used to determine if a user is logged in
  readonly WEBSITE_USER_DATA_URL: string;
};

let config : PrivateConfigDataType;
try {
  const unparsedJson = fs.readFileSync( pathToConfig, 'utf8' );
  config = JSON.parse( unparsedJson );
}
catch( e ) {
  console.error( e );
  throw new Error( `Unable to read or parse the configuration file at ${pathToConfig}. Please ensure it exists and is valid JSON.` );
}

// eslint-disable-next-line phet/bad-text
if ( config.BABEL_BRANCH && config.BABEL_BRANCH === 'master' ) {

  // eslint-disable-next-line phet/bad-text
  console.error( 'The branch name "master" is no longer supported, please update your config.  Aborting.' );
  throw new Error( 'Invalid branch name for string repo.' );
}

export default config;