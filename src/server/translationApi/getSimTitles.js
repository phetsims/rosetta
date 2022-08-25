// Copyright 2022, University of Colorado Boulder

import logger from './logger.js';
import getSimMetadata from './getSimMetadata.js';

const getSimTitles = async () => {
  try {
    const simMetadata = await getSimMetadata();
    const simTitles = [];
    for ( const project of simMetadata.projects ) {
      for ( const sim of project.simulations ) {
        const localizedSims = sim.localizedSimulations;
        const simTitle = localizedSims.en.title;
        simTitles.push( simTitle );
      }
    }
    console.log( simTitles );
  }
  catch( e ) {
    logger.error( e );
  }
};

( async () => {
  await getSimTitles();
} )();

export default getSimTitles;