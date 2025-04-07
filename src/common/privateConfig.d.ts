// Copyright 2022, University of Colorado Boulder

/**
 * Types for private configuration.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type PrivateConfigDataType = {
  readonly 'ROSETTA_PORT': number;
  readonly 'PERFORM_STRING_COMMITS' : boolean;
};

export default {} as PrivateConfigDataType;

export const pathToConfig: string;