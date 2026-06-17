// Copyright 2022, University of Colorado Boulder

/**
 * Utility function, see function header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import getBuildInfo from './getBuildInfo.js';

/**
 * Return the SHA of the most recently published (latest) version of the specified sim.
 *
 * @param simName - lowercase kebab case sim name, e.g. acid-base-solutions
 * @returns the SHA as a string
 */
const getLatestSimSha = async ( simName: string ): Promise<string> => {
  const buildInfo = await getBuildInfo( simName, 'latest' );
  return buildInfo.totalitySHA;
};

export default getLatestSimSha;