// Copyright 2022, University of Colorado Boulder

import config from '../../common/config.js';
import logger from './logger.js';

const extractSimName = sim => {
  let simName = false;
  const wantSimVisible = config.ENVIRONMENT === 'development' ||
                         ( config.ENVIRONMENT === 'production' &&
                           ( sim.visible || sim.isPrototype ) );
  if ( wantSimVisible ) {
    simName = sim.name;
  }
  return simName;
};

const getSimNamesAndTitles = simMetadata => {
  logger.info( 'getting sim names and titles' );
  const simNamesAndTitles = {};
  try {
    for ( const project of simMetadata.projects ) {
      for ( const sim of project.simulations ) {
        const simTitle = sim.localizedSimulations.en.title;
        const simName = extractSimName( sim );
        if ( simName ) {
          simNamesAndTitles[ simName ] = simTitle;
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
    simNamesAndTitles.error = 'unable to get sim names and titles';
  }
  logger.info( 'returning sim names and titles' );
  return simNamesAndTitles;
};

export default getSimNamesAndTitles;