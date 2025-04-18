// Copyright 2022, University of Colorado Boulder

/**
 * Define a function that gets dependencies for the specified simulation and version.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import privateConfig from '../../common/privateConfig.js';
import { Brand } from './Brand.js';
import logger from './logger.js';

/**
 * Get the dependencies for the specified simulation and version.
 *
 * @param simName - The name of the simulation.
 * @param version - The version of the simulation.
 * @param brand - The brand of the sim for which the dependencies are needed. Valid values are 'phet' or 'phet-io'.
 * @returns A promise resolving to a string containing JSON data with dependencies.
 */
const getDependencies = async ( simName: string, version: string, brand: Brand = 'phet' ): Promise<string> => {

  let dependencies = 'error: unable to get dependencies';

  // Compose the URL where the dependencies should be.
  let dependenciesUrl = '';
  if ( brand === 'phet' ) {
    dependenciesUrl = `${privateConfig.SERVER_URL}/sims/html/${simName}/${version}/dependencies.json`;
  }
  else if ( brand === 'phet-io' ) {
    dependenciesUrl = `${privateConfig.PHET_IO_SERVER_URL}/sims/${simName}/${version}/dependencies.json`;
  }
  else {
    const errorMessage = `invalid brand when getting dependencies: ${brand}`;
    logger.error( errorMessage );
    throw new Error( errorMessage );
  }

  // Get the dependencies.
  logger.info( `getting dependencies from ${dependenciesUrl}` );
  try {
    const response = await fetch( dependenciesUrl );
    if ( response.ok ) {
      const dependenciesJsonObject = await response.json();
      dependencies = JSON.stringify( dependenciesJsonObject );
    }
    else {
      logger.error( `error getting dependencies: ${response.status} ${response.statusText}, returning error object` );
    }
  }
  catch( e ) {
    logger.error( `unable to obtain dependencies for ${simName} version ${version}, error = ${e}` );
    throw new Error( 'unable to obtain dependencies' );
  }
  logger.info( 'returning dependencies' );
  return dependencies;
};

export default getDependencies;