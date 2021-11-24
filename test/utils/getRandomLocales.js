// Copyright 2021, University of Colorado Boulder

import getLocaleInfo from '../../src/server/getLocaleInfo.js';
import logger from '../../src/server/logger.js';

/**
 * N.B. - This should only be used in development. Before we deploy, we need to test all sims.
 */

const getRandomLocales = async numberOfLocalesToGet => {
  const randomLocales = [];
  try {
    const localeInfo = await getLocaleInfo();
    const locales = Object.keys( localeInfo );
    if ( numberOfLocalesToGet > locales.length ) {

      // webstorm is being too fussy here, in my opinion
      throw new Error( 'the number of locales you want to get is greater than the total number of locales' );
    }
    else {
      for ( let i = 0; i < numberOfLocalesToGet; i++ ) {
        const index = Math.floor( Math.random() * locales.length ); // eslint-disable-line bad-sim-text
        randomLocales.push( locales[ index ] );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return randomLocales;
};

export { getRandomLocales as default };