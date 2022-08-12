// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function to get a sim's URL.
 *
 * @author Liam Mulhall
 */

import config from '../common/config.js';
import logger from './logger.js';

/**
 * Return a sim's URL.
 *
 * @param {String} simName - sim name
 * @returns {String} - sim url
 */
const getSimUrl = simName => {
  console.time( 'getSimUrl' );
  logger.info( `getting ${simName}'s sim url` );
  logger.info( `got ${simName}'s sim url; returning it` );
  console.timeEnd( 'getSimUrl' );
  return `${config.SERVER_URL}/sims/html/${simName}/latest/${simName}_en.html`;
};

export default getSimUrl;