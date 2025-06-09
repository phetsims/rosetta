// Copyright 2023, University of Colorado Boulder

/**
 * Export a function that gets a shared sim's translated string keys and their values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { StringKeysAndValues } from '../ServerDataTypes.js';
import logger from '../logger.js';
import { longTermStorage } from '../translationApi.js';

/**
 * Return a shared sim's translated string keys and their values.
 *
 * @param simName - name of the mother sim
 * @param locale - locale of the translated strings
 * @param sharedKeys - list of shared string keys in the child sim
 * @returns - shared translated string keys and their values (their translated strings)
 */
const getSharedTranslatedStringKeysAndValues = async (
  simName: string,
  locale: string,
  sharedKeys: string[]
): Promise<StringKeysAndValues> => {
  logger.info( `getting ${simName}'s shared translated string keys and values` );
  const sharedTranslatedStringKeysAndValues: StringKeysAndValues = {};
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