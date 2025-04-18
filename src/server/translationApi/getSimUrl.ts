// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function to get a sim's URL.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

/**
 * Return a sim's URL.
 *
 * @param simName - sim name
 * @returns - sim url
 */
const getSimUrl = ( simName: string ): string => {
  const simUrl = `${privateConfig.SERVER_URL}/sims/html/${simName}/latest/${simName}_en.html`;
  logger.info( `url requested for ${simName}, returning ${simUrl}` );
  return simUrl;
};

export default getSimUrl;