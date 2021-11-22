// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getEnglishStringKeysAndStrings from './getEnglishStringKeysAndStrings.js';
import logger from './logger.js';

const getSimSpecificEnglishStringKeysAndStrings = async simName => {
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
        stringKeysToSimSpecificEnglishStrings.set( stringKey, 'no longer used' ); // todo: don't display strings that are no longer used
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return [ ...stringKeysToSimSpecificEnglishStrings ];
};

export { getSimSpecificEnglishStringKeysAndStrings as default };