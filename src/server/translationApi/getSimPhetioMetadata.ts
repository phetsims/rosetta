// Copyright 2021-2025, University of Colorado Boulder

/**
 * Get the PhET-io metadata for all sims. This is handled differently than the metadata for the PhET sims, because it
 * is needed only for build requests, which are not made as often as the PhET metadata is needed.  So, there is no
 * caching of the metadata.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import privateConfig from '../../common/privateConfig.js';
import { SimPhetioMetadata } from './SimMetadataTypes.js';

const PHET_IO_METADATA_URL = privateConfig.SERVER_URL + '/services/metadata/phetio?active=true&latest=true';
const REQ_OPTIONS = {
  headers: {
    Authorization: `Basic ${Buffer.from( `token:${privateConfig.SERVER_TOKEN}` ).toString( 'base64' )}`
  }
};

/**
 * Return the sim metadata object. Update it if it is stale, otherwise use cached sim metadata.
 *
 * @returns A promise resolving to the sim metadata
 * @throws Error if the metadata cannot be retrieved
 */
const getSimPhetioMetadata = async (): Promise<SimPhetioMetadata[]> => {

  const response = await fetch( PHET_IO_METADATA_URL, REQ_OPTIONS );

  if ( !response.ok ) {
    throw new Error( `failed to fetch phet-io metadata: ${response.statusText}` );
  }

  return await response.json() as SimPhetioMetadata[];
};

export default getSimPhetioMetadata;