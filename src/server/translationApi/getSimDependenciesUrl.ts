// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function, see function documentation for details.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { UNPUBLISHED_SIMS_TO_INCLUDE } from '../../common/constants.js';
import privateConfig from '../../common/privateConfig.js';
import { Brand } from './getDependencies.js';
import logger from './logger.js';

/**
 * Get the URL for a sim's dependencies based on several factors such as brand, version, and whether the sim is
 * published.
 *
 * @param simName - sim name
 * @param version - sim version
 * @param brand - the brand of the sim for which the dependencies are needed, e.g. 'phet' or 'phet-io'
 * @returns - sim dependencies URL
 */
const getSimDependenciesUrl = ( simName: string, version: string, brand: Brand = 'phet' ): string => {

  if ( brand !== 'phet' && brand !== 'phet-io' ) {
    logger.error( `invalid brand when getting dependencies: ${brand}` );
    brand = 'phet'; // Default to 'phet' if an invalid brand is provided.
  }

  // See if this is an unpublished sim and if so, get the information needed to fulfil this request.
  const unpublishedSimInfo = UNPUBLISHED_SIMS_TO_INCLUDE.find( simInfo => simInfo.name === simName ) || null;

  let dependenciesUrl;
  if ( unpublishedSimInfo ) {

    // If this is an unpublished sim, use the provided resource URL.  Note that this ignores the version parameter.
    dependenciesUrl = `${unpublishedSimInfo.simResourceUrl}/dependencies.json`;
  }
  else {
    if ( brand === 'phet' ) {
      dependenciesUrl = `${privateConfig.SERVER_URL}/sims/html/${simName}/${version}/dependencies.json`;
    }
    else {
      dependenciesUrl = `${privateConfig.PHET_IO_SERVER_URL}/sims/${simName}/${version}/dependencies.json`;
    }
  }

  return dependenciesUrl;
};

export default getSimDependenciesUrl;