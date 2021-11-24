// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getEnglishStringKeysAndStrings from './getEnglishStringKeysAndStrings.js';
import logger from './logger.js';

const getSimSpecificEnglishStringKeysAndStrings = async simName => {
  logger.info( `getting ${simName}'s sim-specific english string keys and strings` );
  const stringKeysToSimSpecificEnglishStrings = new Map();
  try {
    const categorizedStringKeysRes = await getCategorizedStringKeys( simName );
    const simSpecificStringKeys = categorizedStringKeysRes.simSpecific;
    const englishStringKeysAndStrings = await getEnglishStringKeysAndStrings( simName );
    const englishStringKeys = Object.keys( englishStringKeysAndStrings );
    for ( const stringKey of simSpecificStringKeys ) {
      if ( englishStringKeys.includes( stringKey ) ) {
        stringKeysToSimSpecificEnglishStrings.set( stringKey, englishStringKeysAndStrings[ stringKey ].value );
      }
      else {

        // we don't display unused string keys and strings to the user
        // they get stripped out prior to sending them to the client
        stringKeysToSimSpecificEnglishStrings.set( stringKey, 'no longer used' );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s sim-specific english string keys and strings; returning them` );
  return [ ...stringKeysToSimSpecificEnglishStrings ];
};

export { getSimSpecificEnglishStringKeysAndStrings as default };