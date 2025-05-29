// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function, see function documentation for details.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { UNPUBLISHED_SIMS_TO_INCLUDE } from '../../common/constants.js';
import privateConfig from '../../common/privateConfig.js';

/**
 * Return a sim's base URL meaning the portion of the URL that is common for accessing the sim's HTML file and its
 * assets, such as the string map file.
 *
 * @param simName - sim name
 * @returns - sim base url
 */
const getSimBaseUrl = ( simName: string ): string => {

  // See if this is an unpublished sim and if so, get the information for it.
  const unpublishedSimInfo = UNPUBLISHED_SIMS_TO_INCLUDE.find( simInfo => simInfo.name === simName ) || null;

  return unpublishedSimInfo ?
         `https://phet-dev.colorado.edu/html/${simName}/${unpublishedSimInfo.version}/phet` :
         `${privateConfig.SERVER_URL}/sims/html/${simName}/latest`;
};

export default getSimBaseUrl;