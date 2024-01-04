// Copyright 2021-2022, University of Colorado Boulder

/**
 * Shared function, see function header for details.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import axios from 'axios';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

/**
 * The function getStringKeysUsedInSim returns the list of all string keys used in the currently live version of the
 * specified PhET simulation.  This includes sim-specific strings and common-code strings.
 * @param simName {string} - the sim for which to get the string keys where the name matches the home repo for the sim,
 *                           e.g. states-of-matter-basics
 * @returns {Object} - used strings keys and their English values in a format like this:
 *                     {
 *                       "BALANCING_CHEMICAL_EQUATIONS/products": "Products",
 *                       "BALANCING_CHEMICAL_EQUATIONS/reactants": "Reactants",
 *                       "VEGAS/pattern.0hours.1minutes.2seconds": "{0}:{1}:{2}",
 *                       .
 *                       .
 *                       .
 *                     }
 *                     If the file can't be retrieved an empty object will be returned.
 */
const getStringKeysUsedInSim = async simName => {

  // Assemble the URL for the English string map.
  const stringMapUrl = `${privateConfig.SERVER_URL}/sims/html/${simName}/latest/english-string-map.json`;

  logger.info( `getting string map from ${stringMapUrl}` );

  let stringsUsedInSim = {};

  // Request the string map file.
  try {
    const stringMapResponse = await axios.get( stringMapUrl );
    stringsUsedInSim = stringMapResponse.data;
    logger.info( 'request for string map file succeeded' );
  }
  catch( e ) {
    logger.error( `error while requesting string map file: ${e}` );
  }

  return stringsUsedInSim;
};

export default getStringKeysUsedInSim;