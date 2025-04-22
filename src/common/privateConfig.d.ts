// Copyright 2022, University of Colorado Boulder

/**
 * Types for private configuration.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type PrivateConfigDataType = {

  // the branch of the phetsims/babel repo to use for long-term storage, useful for debugging
  readonly BABEL_BRANCH: string;

  // authentication token needed to request builds from the build server
  readonly 'BUILD_SERVER_AUTH' : string;

  // the name to use for the short-term string storage database
  readonly 'DB_NAME' : string;

  // the name of the collection (table) in the short-term string storage database
  readonly 'DB_SHORT_TERM_STORAGE_COLLECTION_NAME' : string;

  // the URL of the short-term string storage database
  readonly 'DB_URI' : string;

  // whether the short-term storage database is enabled
  readonly 'DB_ENABLED' : boolean;

  // the Personal Access Token (PAT) for GitHub, used to authenticate requests to the GitHub API
  readonly GITHUB_PAT : string;

  // the URL of the GitHub repository where long-term storage is located
  readonly GITHUB_URL : string;

  // Winston's logger severity level. We only use error, warn, verbose, and info.
  readonly LOGGER_LEVEL : string;

  // whether to perform string commits to long-term storage, which is GitHub as of this writing
  readonly 'PERFORM_STRING_COMMITS' : boolean;

  // URL of the server where the phet-io sims are hosted
  readonly PHET_IO_SERVER_URL : string;

  // port number for the server portion of Rosetta
  readonly 'ROSETTA_PORT': number;

  // whether to send build requests to the build server - useful for testing without sending build requests
  readonly 'SEND_BUILD_REQUESTS' : boolean;

  // the authorization token needed for metadata requests from the PhET server(s)
  readonly 'SERVER_TOKEN' : string;

  // the URL of the PhET server where sims live, and where metadata requests and build server requests are sent
  readonly 'SERVER_URL' : boolean;

  // whether to generate a short translation report, which is useful for debugging without hitting GitHub excessively
  readonly 'SHORT_REPORT' : boolean;

  // the duration in milliseconds that locale info is valid for
  readonly 'VALID_LOCALE_INFO_DURATION' : number;
};

export default {} as PrivateConfigDataType;

export const pathToConfig: string;