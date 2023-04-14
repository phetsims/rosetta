// Copyright 2023, University of Colorado Boulder

/**
 * Export a function that gets a shared sim's translated string keys and their values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from '../logger.js';
import { longTermStorage } from '../translationApi.js';

/**
 * Return a shared sim's translated string keys and their values.
 *
 * @param {String} simName - name of the mother sim
 * @param {String} locale - locale of the translated strings
 * @param {String[]} sharedKeys - list of shared string keys in the child sim
 * @returns {Promise<Object>}
 */
const getSharedTranslatedStringKeysAndValues = async (
  simName,
  locale,
  sharedKeys
) => {
  logger.info( `getting ${simName}'s shared translated string keys and values` );
  const sharedTranslatedStringKeysAndValues = {};
  const stringKeysAndTranslatedValues = await longTermStorage.get( simName, locale );
  const translatedStringKeys = Object.keys( stringKeysAndTranslatedValues );

  for ( const stringKey of sharedKeys ) {
    if ( translatedStringKeys.includes( stringKey ) ) {
      sharedTranslatedStringKeysAndValues[ stringKey ] = stringKeysAndTranslatedValues[ stringKey ].value;
    }
    else {
      sharedTranslatedStringKeysAndValues[ stringKey ] = '';
    }
  }
  logger.info( `got ${simName}'s shared translated string keys and values; returning them` );
  return sharedTranslatedStringKeysAndValues;
};

export default getSharedTranslatedStringKeysAndValues;