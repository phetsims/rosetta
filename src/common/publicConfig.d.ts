// Copyright 2022, University of Colorado Boulder

/**
 * Types for public configuration.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type PublicConfigDataType = {
  readonly 'ENVIRONMENT': string;
  readonly 'IS_ENABLED': boolean;
  readonly 'LOCAL_USER_ID': number;
  readonly 'SIGN_OUT_URL': string;
  readonly 'VALID_METADATA_DURATION': number;
  readonly 'WEBSITE_USER_DATA_URL': string;
};

export default {} as PublicConfigDataType;