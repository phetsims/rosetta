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

import logger from './logger.js';

const getStringKeysUsedInSim = async ( simName: string ): Promise<string> => {

  // Assemble the URL for the English fluent.
  // const fluentFileUrl = `${privateConfig.SERVER_URL}/sims/html/${simName}/latest/english-string-map.json`;

  const fluentFileUrl = 'http://localhost/greenhouse-effect/strings/GreenhouseEffect_en.ftl';

  logger.info( `getting fluent from ${fluentFileUrl}` );

  let fileContents = '';

  // Request the fluent file.
  try {
    const response = await fetch( fluentFileUrl );

    if ( response.ok ) {
      fileContents = await response.text();
      logger.info( 'request for fluent file succeeded' );
    }
    else {
      logger.error( `request for fluent file failed: ${response.status} ${response.statusText}` );
    }
  }
  catch( e ) {
    logger.error( `error while requesting fluent file for ${simName}: ${e}` );
  }

  return fileContents;
};

export default getStringKeysUsedInSim;