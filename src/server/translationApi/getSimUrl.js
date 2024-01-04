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
 * @param {String} simName - sim name
 * @returns {String} - sim url
 */
const getSimUrl = simName => {
  const simUrl = `${privateConfig.SERVER_URL}/sims/html/${simName}/latest/${simName}_en.html`;
  logger.info( `url requested for ${simName}, returning ${simUrl}` );
  return simUrl;
};

export default getSimUrl;