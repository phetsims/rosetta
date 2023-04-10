// Copyright 2022, University of Colorado Boulder

/**
 * Create an object containing shared translation form data.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getStringFile from './getStringFile.js';
import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

/**
 * Get data needed for rendering shared string translation form table.
 *
 * @param {String} simName - name of sim we're getting data for
 * @param {String} locale - locale code of sim
 * @param {String[]} sharedStringKeys - list of shared string keys
 * @param {String[]} sharedSims - list of sims that share string keys
 * @returns {Promise<Object>} - shared translation form data
 */
const getSharedTranslationFormData = async (
  simName,
  locale,
  sharedStringKeys,
  sharedSims
) => {
  logger.info( 'getting shared translation form data' );
  const sharedTranslationFormData = {};

  // As of this writing, most sims do not have shared strings. Thus, we add a
  // check here to ensure there are shared string keys before making request
  // for string files.
  if ( sharedStringKeys.length > 0 ) {
    try {

      // Get string files.
      const englishStringFileObjects = [];
      const translatedStringFiles = [];
      for ( const sim of sharedSims ) {
        const englishStringFileObject = {
          repo: sim,
          fileContents: await getStringFile( sim )
        };
        englishStringFileObjects.push( englishStringFileObject );
        translatedStringFiles.push( await longTermStorage.get( sim, locale ) );
      }

      // Populate string keys and values.
      const englishKeyValueAndRepoObjects = {};
      const translatedKeysAndValues = {};
      for ( const stringKey of sharedStringKeys ) {

        // Populate English string keys and values. We need a repo associated with each string key
        // because we need a comprehensive list of repos to iterate over when we make the translation
        // file contents for this translation. For more context on this, see
        // https://github.com/phetsims/rosetta/issues/360.
        for ( const stringFileObject of englishStringFileObjects ) {
          if ( Object.keys( stringFileObject.fileContents ).includes( stringKey ) ) {
            englishKeyValueAndRepoObjects[ stringKey ] = {
              value: stringFileObject.fileContents[ stringKey ].value,
              repo: stringFileObject.repo
            };
          }
        }

        // Populate translated string keys and values.
        for ( const stringFile of translatedStringFiles ) {
          if ( Object.keys( stringFile ).includes( stringKey ) ) {
            translatedKeysAndValues[ stringKey ] = stringFile[ stringKey ].value;
          }
        }
      }

      // Create the shared translation form data object.
      for ( const stringKey of sharedStringKeys ) {

        // If the English value of the string is empty, it doesn't make sense to present
        // the string to the translator. The translator won't be able to translate an
        // empty string. See https://github.com/phetsims/rosetta/issues/388.
        if (
          englishKeyValueAndRepoObjects[ stringKey ] &&
          englishKeyValueAndRepoObjects[ stringKey ].value === ''
        ) {
          continue;
        }

        // Strip out dots so client doesn't think there are more deeply nested
        // objects than there really are.
        const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );
        if (
          englishKeyValueAndRepoObjects[ stringKey ] &&
          Object.keys( translatedKeysAndValues ).length > 0 &&
          translatedKeysAndValues[ stringKey ]
        ) {

          // Ensure each string key in the shared translation form data has a repo
          // associated with it. For more context on why we do this, see
          // https://github.com/phetsims/rosetta/issues/360.
          sharedTranslationFormData[ stringKeyWithoutDots ] = {
            english: englishKeyValueAndRepoObjects[ stringKey ].value,
            translated: translatedKeysAndValues[ stringKey ],
            repo: englishKeyValueAndRepoObjects[ stringKey ].repo
          };
        }
        else if (
          ( englishKeyValueAndRepoObjects[ stringKey ] &&
            Object.keys( translatedKeysAndValues ).length === 0 ) ||
          ( englishKeyValueAndRepoObjects[ stringKey ] &&
            !translatedKeysAndValues[ stringKey ] )
        ) {
          sharedTranslationFormData[ stringKeyWithoutDots ] = {
            english: englishKeyValueAndRepoObjects[ stringKey ].value,
            translated: '',
            repo: englishKeyValueAndRepoObjects[ stringKey ].repo
          };
        }
      }
    }
    catch( e ) {
      logger.error( e );
    }
  }
  logger.info( 'returning shared translation form data' );
  return sharedTranslationFormData;
};

export default getSharedTranslationFormData;