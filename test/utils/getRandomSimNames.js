// Copyright 2021, University of Colorado Boulder

import getSimNames from '../../src/server/getSimNames.js';
import logger from '../../src/server/logger.js';

/**
 * N.B. - This should only be used in development. Before we deploy, we need to test all sims.
 */

const getRandomSimNames = async numberOfSimNamesToGet => {
  logger.info( `getting ${numberOfSimNamesToGet} random sim name(s)` );
  const randomSimNames = [];
  try {
    const simNames = await getSimNames();
    if ( numberOfSimNamesToGet > simNames.length ) {

      // webstorm is being too fussy here, in my opinion
      throw new Error( 'the number of sim names you want to get is greater than the total number of sim names' );
    }
    else {
      for ( let i = 0; i < numberOfSimNamesToGet; i++ ) {
        const index = Math.floor( Math.random() * simNames.length ); // eslint-disable-line bad-sim-text
        randomSimNames.push( simNames[ index ] );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${numberOfSimNamesToGet} random sim name(s); returning it(them)` );
  return randomSimNames;
};

export { getRandomSimNames as default };