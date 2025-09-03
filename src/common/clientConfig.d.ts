// Copyright 2025, University of Colorado Boulder

/**
 * Type data for the client configuration.  This is needed because the client configuration TypeScript file is a build
 * product that is not checked in, so without this file type checking will fail.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type ClientConfiguration = {

  // The environment in which the client is running, e.g. "development" or "production".
  readonly 'ENVIRONMENT': string;

  // A flag indicating whether Rosetta is enabled.  If false, the client will not allow any interaction with the server
  // and will present a message to the user indicating that Rosetta is down for maintenance.
  readonly 'IS_ENABLED': boolean;

  // A user ID for local development.  This is used to simulate a logged-in user when running in the development mode,
  // which saves the developer from having to log in each time they want to test something.
  readonly 'LOCAL_USER_ID': number;

  // The URL to use to sign the user out of Rosetta.
  readonly 'SIGN_OUT_URL': string;

  // The duration in milliseconds for which simulation metadata is considered valid and is cached.
  readonly 'VALID_METADATA_DURATION': number;

  // The URL for user data, such as the current login state of a user.
  readonly 'WEBSITE_USER_DATA_URL': string;
};

declare const clientConfig: ClientConfiguration;
export default clientConfig;