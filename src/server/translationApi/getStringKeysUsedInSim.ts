// Copyright 2021-2022, University of Colorado Boulder

/**
 * Function for getting a list of the string keys used in a sim.
 *
 * @param simName - the sim for which to get the string keys where the name matches the home repo for the sim,
 *                  e.g. states-of-matter-basics
 * @returns used strings keys and their English values in a format like this:
 *          {
 *            "BALANCING_CHEMICAL_EQUATIONS/products": "Products",
 *            "BALANCING_CHEMICAL_EQUATIONS/reactants": "Reactants",
 *            "VEGAS/pattern.0hours.1minutes.2seconds": "{0}:{1}:{2}",
 *            .
 *            .
 *            .
 *          }
 *          If the file can't be retrieved an empty object will be returned.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

type StringKeys = Record<string, string>;

const getStringKeysUsedInSim = async ( simName: string ): Promise<StringKeys> => {

  // Assemble the URL for the English string map.
  const stringMapUrl = `${privateConfig.SERVER_URL}/sims/html/${simName}/latest/english-string-map.json`;

  logger.info( `getting string map from ${stringMapUrl}` );

  let stringsUsedInSim: StringKeys = {};

  // Request the string map file.
  try {
    const response = await fetch( stringMapUrl );
    if ( response.ok ) {
      stringsUsedInSim = ( await response.json() ) as StringKeys;
      logger.info( 'request for string map file succeeded' );
    }
    else {
      logger.error( `request for string map file failed: ${response.status} ${response.statusText}` );
    }
  }
  catch( e ) {
    logger.error( `error while requesting string map file for ${simName}: ${e}` );
  }

  return stringsUsedInSim;
};

export default getStringKeysUsedInSim;