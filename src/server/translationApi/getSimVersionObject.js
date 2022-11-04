// Copyright 2022, University of Colorado Boulder

import getSimMetadata from './getSimMetadata.js';
import logger from './logger.js';

const getSimVersionObject = async simName => {
  let latestVersionOfSim = '';
  try {
    const simMetadata = await getSimMetadata();
    const projects = simMetadata.projects;
    for ( const i of Object.keys( projects ) ) {
      if ( projects[ i ].name.includes( simName ) ) {
        latestVersionOfSim = projects[ i ].version;
      }
    }
  }
  catch( e ) {
    latestVersionOfSim = 'error';
    logger.error( e );
  }
  return latestVersionOfSim;
};

export default getSimVersionObject;