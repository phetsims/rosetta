// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const getSimSpecificTranslatedStringKeysAndStrings = async ( simName, locale ) => {
  const simSpecificTranslatedStringKeysAndStrings = new Map();
  try {
    const categorizedStringKeys = await getCategorizedStringKeys( simName );
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const translatedStringFileUrl = getTranslatedStringFileUrl( simName, locale );
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
    logger.error( e );
  }
  return [ ...simSpecificTranslatedStringKeysAndStrings ];
};

export { getSimSpecificTranslatedStringKeysAndStrings as default };