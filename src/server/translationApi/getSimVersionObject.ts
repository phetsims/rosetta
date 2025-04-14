// Copyright 2022, University of Colorado Boulder

/**
 * Extract the version object for the given sim from the sim metadata and return it.
 *
 * @param simName - name of the sim in repo format, e.g. build-an-atom
 * @returns A promise that resolves to the version object
 * @throws Error if the sim name is not found in the metadata or metadata cannot be retrieved
 *
 * @author Liam Mulhall
 * @author John Blanco (PhET Interactive Simulations)
 */

import getSimMetadata from './getSimMetadata.js';
import logger from './logger.js';
import { MetadataSimVersion } from './SimMetadataTypes.js';

const getSimVersionObject = async ( simName: string ): Promise<MetadataSimVersion> => {
  let latestVersionOfSim: MetadataSimVersion | null = null;
  try {
    const simMetadata = await getSimMetadata();
    const projects = simMetadata.projects;
    for ( let i = 0; i < projects.length; i++ ) {
      const project = projects[ i ];
      if ( project.name === `html/${simName}` ) {
        latestVersionOfSim = projects[ i ].version;
        break;
      }
    }
  }
  catch( e ) {
    logger.error( `getSimVersionObject unable to get version, error = ${e}` );
    throw e;
  }

  if ( !latestVersionOfSim ) {
    logger.error( `getSimVersionObject unable to find version for sim: ${simName}` );
    throw new Error( `Unable to find version for sim: ${simName}` );
  }
  return latestVersionOfSim;
};

export default getSimVersionObject;