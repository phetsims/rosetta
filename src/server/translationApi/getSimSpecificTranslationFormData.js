// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a sim's sim-specific string keys, their
 * English values, and their translated values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getLatestSimSha from './getLatestSimSha.js';
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
    const publishedSha = await getLatestSimSha( simName );
    const simSpecificEnglishStringKeysAndStrings = await getStringFile( simName, publishedSha );

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
      else {
        logger.warn( `string key ${stringKey} in sim, but not found in english file` );
      }

      let translatedValue = '';
      if ( simSpecificTranslatedStringKeysAndStrings[ stringKey ] ) {
        translatedValue = simSpecificTranslatedStringKeysAndStrings[ stringKey ].value;
      }

      const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );

      // TODO: Remove this conditional code once we're sure all string keys no longer have the legacy "visible" property. See https://github.com/phetsims/rosetta/issues/411.
      const shouldBeVisible = simSpecificEnglishStringKeysAndStrings[ stringKey ]?.visible !== false;
      if ( shouldBeVisible ) {
        simSpecific[ stringKeyWithoutDots ] = {
          english: englishValue,
          translated: translatedValue
        };
      }
      else {
        logger.warn( `legacy visible field false; not adding ${stringKey} to the translation form data` );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }

  logger.info( 'got sim-specific translation form data; returning it' );

  return simSpecific;
};

export default getSimSpecificTranslationFormData;