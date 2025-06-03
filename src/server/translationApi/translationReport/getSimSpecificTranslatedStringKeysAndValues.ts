// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an object containing sim-specific translated string keys and values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { StringKeysAndValues } from '../RosettaServerDataTypes.js';
import { CategorizedStringKeys } from '../getCategorizedStringKeys.js';
import logger from '../logger.js';
import { longTermStorage } from '../translationApi.js';

/**
 * Return an object containing sim-specific translated string keys and values.
 *
 * @param simName - sim name
 * @param locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns - sim-specific translated string keys and their values (their strings)
 */
const getSimSpecificTranslatedStringKeysAndValues = async (
  simName: string,
  locale: string,
  categorizedStringKeys: CategorizedStringKeys
): Promise<StringKeysAndValues> => {
  logger.info( `getting ${simName}'s sim-specific translated string keys and values` );
  const simSpecificTranslatedStringKeysAndValues: StringKeysAndValues = {};
  const simSpecificStringKeys = categorizedStringKeys.simSpecific;
  const stringKeysAndTranslatedValues = await longTermStorage.get( simName, locale );
  const translatedStringKeys = Object.keys( stringKeysAndTranslatedValues );

  // For each sim specific string key...
  for ( const stringKey of simSpecificStringKeys ) {

    // If the translated string key has a value...
    if ( translatedStringKeys.includes( stringKey ) ) {

      // Map the string key to its translated value.
      simSpecificTranslatedStringKeysAndValues[ stringKey ] = stringKeysAndTranslatedValues[ stringKey ].value;
    }
    else {

      // Map the string key to an empty string.
      simSpecificTranslatedStringKeysAndValues[ stringKey ] = '';
    }
  }
  logger.info( `got ${simName}'s sim-specific translated string keys and values; returning them` );

  return simSpecificTranslatedStringKeysAndValues;
};

export default getSimSpecificTranslatedStringKeysAndValues;