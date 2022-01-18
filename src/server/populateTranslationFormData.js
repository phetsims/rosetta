// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function that populates translation form data. This function also transforms the data so that it
 * can be easily parsed by the client. See the multiline comment in the function.
 *
 * @author Liam Mulhall
 */

import logger from './logger.js';

/**
 * Return populated translation form data. Also strip any dots (.'s) out of the string so that the client can easily
 * parse the data.
 *
 * @param {{simSpecific: {}, common: {}}} translationFormData - translation form data
 * @param {String} dataToPopulate - either sim-specific or common
 * @param {String[]} stringKeys - list of sim-specific or common string keys
 * @param {String[][]} englishStringKeysAndStrings - ordered pairs of English string keys and their values (their strings)
 * @param {String[][]} translatedStringKeysAndStrings - ordered pairs of translated string keys and their values (their strings)
 */
const populateTranslationFormData = ( translationFormData,
                                      dataToPopulate,
                                      stringKeys,
                                      englishStringKeysAndStrings,
                                      translatedStringKeysAndStrings
) => {
  logger.info( `populating ${dataToPopulate} translation form data` );

  /**
   * Here we populate the translation form data. This snippet is special for a couple of reasons.
   *
   * (1) It discards unused string keys and strings.
   *
   * (2) It strips the dots out of the string keys and replaces them with strings. We do this because the dots cause
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
   * and the translation form data is sent to the client as in (C). When we get the translation form data back from the
   * client in a submission, we transform the data from (C) back to (A).
   */
  for ( let i = 0; i < stringKeys.length; i++ ) {

    // if the string key / string pair is unused, strip it out
    if ( englishStringKeysAndStrings[ i ][ 1 ] === 'no longer used' ) {
      logger.verbose( 'not including unused string key and string in translation form data' );
    }

    // if the string key / string pair is used...
    else {

      // strip out the dots to make it easier for the client to parse the translation form data
      const stringKeyWithoutDots = stringKeys[ i ].replaceAll( '.', '_DOT_' );

      // create an object to add to the translation form data
      const englishAndTranslatedKeysAndValues = {
        english: englishStringKeysAndStrings[ i ][ 1 ],
        translated: translatedStringKeysAndStrings[ i ][ 1 ]
      };

      // add the object we just made
      if ( dataToPopulate === 'sim-specific' ) {
        translationFormData.simSpecific[ stringKeyWithoutDots ] = englishAndTranslatedKeysAndValues;
      }
      else if ( dataToPopulate === 'common' ) {
        translationFormData.common[ stringKeyWithoutDots ] = englishAndTranslatedKeysAndValues;
      }

      // make sure the caller provides the correct parameter
      else {
        logger.error( 'incorrect parameter passed to function that populates translation form data' );
        logger.error( 'please specify sim-specific or common' );
      }
    }
  }
  logger.info( `populated ${dataToPopulate} translation form data` );
};

export default populateTranslationFormData;