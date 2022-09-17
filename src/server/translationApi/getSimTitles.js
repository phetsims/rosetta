// Copyright 2022, University of Colorado Boulder

import getSimMetadata from './getSimMetadata.js';
import logger from './logger.js';

const getSimTitles = async () => {
  let simTitles = [];
  try {
    const simMetadata = await getSimMetadata();
    for ( const project of simMetadata.projects ) {
      for ( const sim of project.simulations ) {
        const localizedSims = sim.localizedSimulations;
        const simTitle = localizedSims.en.title;
        simTitles.push( simTitle );
      }
    }
  }
  catch( e ) {
    simTitles = [ 'error: unable to get sim titles' ];
    logger.error( e );
  }
  return simTitles;
};

export default getSimTitles;