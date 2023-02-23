// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets the version object for a given sim.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimMetadata from './getSimMetadata.js';
import logger from './logger.js';

/**
 * Extract the version object for the given sim from the sim metadata and return it.
 *
 * @param simName - name of the sim
 * @returns {Promise<Object>}
 */
const getSimVersionObject = async simName => {
  let latestVersionOfSim = { error: 'could not get sim version object' };
  try {
    const simMetadata = await getSimMetadata();
    const projects = simMetadata.projects;
    for ( const i of Object.keys( projects ) ) {
      if ( projects[ i ].name === `html/${simName}` ) {
        latestVersionOfSim = projects[ i ].version;
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return latestVersionOfSim;
};

export default getSimVersionObject;