// Copyright 2022, University of Colorado Boulder

/**
 * Define a function that gets dependencies for the specified simulation and version.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import getSimDependenciesUrl from './getSimDependenciesUrl.js';
import logger from './logger.js';

export type Brand = 'phet' | 'phet-io';

/**
 * Get the dependencies for the specified simulation and version.
 *
 * @param simName - The name of the simulation.
 * @param version - The version of the simulation.
 * @param brand - The brand of the sim for which the dependencies are needed, e.g. 'phet' or 'phet-io'.
 * @returns A promise resolving to a string containing JSON data with dependencies.
 */
const getDependencies = async ( simName: string, version: string, brand: Brand = 'phet' ): Promise<string> => {

  let dependencies = 'error: unable to get dependencies';

  // Get the URL where the dependencies should be located.
  const dependenciesUrl = getSimDependenciesUrl( simName, version, brand );

  // Get the dependencies.
  logger.info( `getting dependencies from ${dependenciesUrl}` );
  const response = await fetch( dependenciesUrl );
  if ( response.ok ) {
    const dependenciesJsonObject = await response.json();
    dependencies = JSON.stringify( dependenciesJsonObject );
  }
  else {
    const errorMessage = `error getting dependencies for ${simName}, status = ${response.status}, text = ${response.statusText}`;
    logger.error( errorMessage );
    throw new Error( errorMessage );
  }
  logger.info( 'returning dependencies' );
  return dependencies;
};

export default getDependencies;