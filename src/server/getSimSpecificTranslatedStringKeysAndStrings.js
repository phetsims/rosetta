// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const getSimSpecificTranslatedStringKeysAndStrings = async ( simName, locale ) => {
  logger.info( `getting ${simName}'s sim-specific translated string keys and strings` );
  const simSpecificTranslatedStringKeysAndStrings = new Map();
  try {
    const categorizedStringKeys = await getCategorizedStringKeys( simName );
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const translatedStringFileUrl = getTranslatedStringFileUrl( simName, locale );
    try {
      const stringKeysAndTranslatedValuesRes = await axios.get( translatedStringFileUrl );
      const stringKeysAndTranslatedValues = stringKeysAndTranslatedValuesRes.data;
      const translatedStringKeys = Object.keys( stringKeysAndTranslatedValues );
      for ( const stringKey of simSpecificStringKeys ) {
        if ( translatedStringKeys.includes( stringKey ) ) {
          simSpecificTranslatedStringKeysAndStrings.set( stringKey, stringKeysAndTranslatedValues[ stringKey ].value );
        }
        else {
          simSpecificTranslatedStringKeysAndStrings.set( stringKey, '' );
        }
      }
    }
    catch( e ) {
      if ( e.response.status === 404 ) {
        logger.verbose( 'translated string file doesn\'t exist; setting empty strings' );
        for ( const stringKey of simSpecificStringKeys ) {
          simSpecificTranslatedStringKeysAndStrings.set( stringKey, '' );
        }
      }
      else {
        logger.error( e );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s sim-specific translated string keys and strings; returning them` );
  return [ ...simSpecificTranslatedStringKeysAndStrings ];
};

export { getSimSpecificTranslatedStringKeysAndStrings as default };