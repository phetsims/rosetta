// Copyright 2026, University of Colorado Boulder

/**
 * See function header for a description of this function's functionality.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import { BuildInfoJSON } from '../../../../perennial-alias/js/browser-and-node/PerennialTypes.js';
import getBuildInfoUrl from './getBuildInfoUrl.js';
import logger from './logger.js';

export type Brand = 'phet' | 'phet-io';

// Define a stubbed but type-valid build info object.
const STUBBED_BUILD_INFO_OBJECT: BuildInfoJSON = {
  name: 'not-a-real-sim',
  version: '1.0.0',
  date: '2026-06-11T15:30:00Z',
  totalitySHA: '123456789abcde',
  babelSHA: '123456789abcde',
  dependencyDirectories: []
};

/**
 * Get the build information artifact (buildInfo.json) for the specified simulation and version.
 *
 * @param simName - The name of the simulation.
 * @param version - The version of the simulation.
 * @param brand - The brand of the sim for which the build information is needed, e.g. 'phet' or 'phet-io'.
 * @returns - A promise resolving to a build info object.
 */
const getBuildInfo = async ( simName: string, version: string, brand: Brand = 'phet' ): Promise<BuildInfoJSON> => {

  let buildInfoJsonObject = STUBBED_BUILD_INFO_OBJECT;

  // Get the URL where the dependencies should be located.
  const buildInfoUrl = getBuildInfoUrl( simName, version, brand );

  // Get the dependencies.
  logger.info( `getting build info for ${simName} from ${buildInfoUrl}` );
  const response = await fetch( buildInfoUrl );
  if ( response.ok ) {
    buildInfoJsonObject = await response.json();
    logger.info( `succeeded in getting build info for ${simName}` );
  }
  else {
    const errorMessage = `error getting build info for ${simName}, status = ${response.status}, text = ${response.statusText}`;
    logger.error( errorMessage );
    throw new Error( errorMessage );
  }
  logger.info( `returning build info for ${simName}` );
  return buildInfoJsonObject;
};

export default getBuildInfo;