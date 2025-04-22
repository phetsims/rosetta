// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a sim's sim-specific string keys, their English values, and their translated values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getLatestSimSha from './getLatestSimSha.js';
import getStringFile from './getStringFile.js';
import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

type SimSpecificStringKey = {
  english: string;
  translated: string;
};

type SimSpecificStringKeysAndStrings = Record<string, SimSpecificStringKey>;

/**
 * Return an object that contains a sim's sim-specific string keys, their English values, and their translated values.
 *
 * @param simName - sim name
 * @param locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param simSpecificStringKeys - list of sim-specific string keys
 * @returns - sim-specific string keys, their English values, and their translated values
 */
const getSimSpecificTranslationFormData = async ( simName: string, locale: string, simSpecificStringKeys: string[] ): Promise<SimSpecificStringKeysAndStrings> => {

  logger.info( 'getting sim-specific translation form data' );

  const simSpecific: SimSpecificStringKeysAndStrings = {};

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