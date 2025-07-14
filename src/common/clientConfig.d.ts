// Copyright 2025, University of Colorado Boulder

/**
 * Type data for the client configuration.  This is needed because the client configuration TypeScript file is a build
 * product that is not checked in, so without this file type checking will fail.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type ClientConfigDataType = {
  readonly 'ENVIRONMENT': string;
  readonly 'IS_ENABLED': boolean;
  readonly 'LOCAL_USER_ID': number;
  readonly 'SIGN_OUT_URL': string;
  readonly 'VALID_METADATA_DURATION': number;
  readonly 'WEBSITE_USER_DATA_URL': string;
};

export default {} as ClientConfigDataType;