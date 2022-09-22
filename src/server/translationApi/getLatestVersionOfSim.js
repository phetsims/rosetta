// Copyright 2022, University of Colorado Boulder

import getSimMetadata from './getSimMetadata.js';
import logger from './logger.js';

const getLatestVersionOfSim = async simName => {
  let latestVersionOfSim = '';
  try {
    const simMetadata = await getSimMetadata();
    for ( const project of Object.keys( simMetadata ) ) {
      if ( simMetadata[ project ].name.includes( simName ) ) {
        latestVersionOfSim = simMetadata[ project ].version;
      }
    }
  }
  catch( e ) {
    latestVersionOfSim = 'error';
    logger.error( e );
  }
  return latestVersionOfSim;
};

export default getLatestVersionOfSim;