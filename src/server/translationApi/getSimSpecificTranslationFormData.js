// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a sim's sim-specific string keys, their
 * English values, and their translated values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getStringFile from './getStringFile.js';
import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

/**
 * Return an object that contains a sim's sim-specific string keys, their English values, and their translated values.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {string[]} simSpecificStringKeys - list of sim-specific string keys
 * @returns {Promise<{}>} - sim-specific string keys, their English values, and their translated values
 */
const getSimSpecificTranslationFormData = async (
  simName,
  locale,
  simSpecificStringKeys
) => {

  logger.info( 'getting sim-specific translation form data' );

  const simSpecific = {};

  try {

    // The English file should exist.
    const simSpecificEnglishStringKeysAndStrings = await getStringFile( simName );

    // The translated file might not exist.
    const simSpecificTranslatedStringKeysAndStrings = await longTermStorage.get( simName, locale );

    for ( const stringKey of simSpecificStringKeys ) {

      let englishValue = '';
      if ( simSpecificEnglishStringKeysAndStrings[ stringKey ] ) {
        englishValue = simSpecificEnglishStringKeysAndStrings[ stringKey ].value;

        // If the English value of the string is empty, it doesn't make sense to present
        // the string to the translator. The translator won't be able to translate an
        // empty string. See https://github.com/phetsims/rosetta/issues/388.
        if ( englishValue === '' ) {
          continue;
        }
      }

      let translatedValue = '';
      if ( simSpecificTranslatedStringKeysAndStrings[ stringKey ] ) {
        translatedValue = simSpecificTranslatedStringKeysAndStrings[ stringKey ].value;
      }

      /*
       * This strips the dots out of the string keys and replaces them with strings. We do this because the dots cause
       * the client to think there are more deeply nested keys when there aren't. For example, a string key like
       *
       * (A)
       * "acid-base-solutions.title": {
       *    "value": "Acid-Base Solutions"
       * }
       *
       * would confuse the client. The client would think that it's looking for something like
       *
       * (B)
       * "acid-base-solutions": {
       *    "title": {
       *      "value": "Acid-Base Solutions"
       *    }
       * }
       *
       * but (B) is obviously wrong. The below snippet makes (A) look like
       *
       * (C)
       * "acid-base-solutions_DOT_title": {
       *    "value": "Acid-Base Solutions"
       * }
       *
       * and the translation form data is sent to the client as in (C). When we get the translation form data back from
       * the client in a submission, we transform the data from (C) back to (A).
       */
      const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );

      simSpecific[ stringKeyWithoutDots ] = {
        english: englishValue,
        translated: translatedValue
      };
    }
  }
  catch( e ) {
    logger.error( e );
  }

  logger.info( 'got sim-specific translation form data; returning it' );

  return simSpecific;
};

export default getSimSpecificTranslationFormData;