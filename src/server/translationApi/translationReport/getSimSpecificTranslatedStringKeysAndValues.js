// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an object containing sim-specific translated string keys and values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from '../logger.js';
import { longTermStorage } from '../translationApi.js';

/**
 * Return an object containing sim-specific translated string keys and values.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<Object>} - sim-specific translated string keys and their values (their strings)
 */
const getSimSpecificTranslatedStringKeysAndValues = async (
  simName,
  locale,
  categorizedStringKeys
) => {
  logger.info( `getting ${simName}'s sim-specific translated string keys and values` );
  const simSpecificTranslatedStringKeysAndValues = {};
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