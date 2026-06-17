// Copyright 2021-2022, University of Colorado Boulder

/**
 * Define a utility function, see function header for details.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { SupportedBuildServerBrand } from '../../../../perennial-alias/js/browser-and-node/PerennialTypes.js';
import config from '../../common/config.js';
import { UNPUBLISHED_SIMS_TO_INCLUDE, UnpublishedSimInfo } from '../../common/constants.js';
import logger from './logger.js';

/**
 * Get the URL for a sim's build information based on several factors such as brand, version, and whether the sim is
 * published.
 *
 * @param simName - sim name
 * @param version - sim version
 * @param brand - the brand of the sim for which the build info is needed, e.g. 'phet' or 'phet-io'
 * @returns - sim build info URL
 */
const getBuildInfoUrl = ( simName: string, version: string, brand: SupportedBuildServerBrand = 'phet' ): string => {

  if ( brand !== 'phet' && brand !== 'phet-io' ) {
    logger.error( `invalid brand when getting build info: ${brand}` );
    brand = 'phet'; // Default to 'phet' if an invalid brand is provided.
  }

  // See if this is an unpublished sim and if so, get the information needed to fulfil this request.  This only works
  // in the development environment.
  let unpublishedSimInfo: UnpublishedSimInfo | null = null;
  if ( config.ENVIRONMENT === 'development' ) {
    unpublishedSimInfo = UNPUBLISHED_SIMS_TO_INCLUDE.find( simInfo => simInfo.name === simName ) || null;
  }

  let buildInfoUrl;
  if ( unpublishedSimInfo ) {

    // If this is an unpublished sim, use the provided resource URL.  Note that this ignores the version parameter.
    buildInfoUrl = `${unpublishedSimInfo.simResourceUrl}/buildInfo.json`;
  }
  else {
    if ( brand === 'phet' ) {
      buildInfoUrl = `${config.SERVER_URL}/sims/html/${simName}/${version}/buildInfo.json`;
    }
    else {
      buildInfoUrl = `${config.PHET_IO_SERVER_URL}/sims/${simName}/${version}/buildInfo.json`;
    }
  }

  return buildInfoUrl;
};

export default getBuildInfoUrl;