// Copyright 2022, University of Colorado Boulder

/**
 * Create an object containing shared translation form data.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getStringFile from './getStringFile.js';
import logger from './logger.js';
import { StringKeysAndValues, TranslationDataForRepo } from './RosettaServerDataTypes.js';
import { longTermStorage } from './translationApi.js';

type EnglishStringFileContents = Record<string, { value: string }>;
type SharedTranslationFormData = Record<string, {
  english: string;
  translated: string;
  repo: string;
}>;

/**
 * Get data needed for rendering shared string translation form table.
 *
 * @param locale - locale code of sim
 * @param sharedStringKeys - list of shared string keys
 * @param sharedSims - list of sims that share string keys
 * @returns A promise resolving to shared translation form data
 */
const getSharedTranslationFormData = async ( locale: string,
                                             sharedStringKeys: string[],
                                             sharedSims: string[] ): Promise<SharedTranslationFormData> => {

  logger.info( 'getting shared translation form data' );
  const sharedTranslationFormData: SharedTranslationFormData = {};

  // As of this writing, most sims do not have shared strings. Thus, we add a check here to ensure there are shared
  // string keys before making request for string files.
  if ( sharedStringKeys.length > 0 ) {
    try {

      // Get string files.
      const englishStringFileObjects: { repo: string; fileContents: EnglishStringFileContents }[] = [];
      const translatedStringFiles: TranslationDataForRepo[] = [];
      for ( const sim of sharedSims ) {
        const englishStringFileObject = {
          repo: sim,
          fileContents: await getStringFile( sim )
        };
        englishStringFileObjects.push( englishStringFileObject );
        translatedStringFiles.push( await longTermStorage.get( sim, locale ) );
      }

      // Populate string keys and values.
      const englishKeyValueAndRepoObjects: Record<string, { value: string; repo: string }> = {};
      const translatedKeysAndValues: StringKeysAndValues = {};
      for ( const stringKey of sharedStringKeys ) {

        // Populate English string keys and values.
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

        // If the English value of the string is empty, it doesn't make sense to present the string to the translator.
        // The translator won't be able to translate an empty string. See https://github.com/phetsims/rosetta/issues/388.
        if ( englishKeyValueAndRepoObjects[ stringKey ] && englishKeyValueAndRepoObjects[ stringKey ].value === '' ) {
          continue;
        }

        // Strip out dots so client doesn't think there are more deeply nested objects than there really are.
        const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );
        if (
          englishKeyValueAndRepoObjects[ stringKey ] &&
          Object.keys( translatedKeysAndValues ).length > 0 &&
          translatedKeysAndValues[ stringKey ]
        ) {
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

  const SharedDataKeys = Object.keys( sharedTranslationFormData );
  const a11yKeys = SharedDataKeys.filter( key => key.includes( 'a11y' ) ).sort();
  const otherKeys = SharedDataKeys.filter( key => !key.includes( 'a11y' ) ).sort();
  const sortedSharedData: SharedTranslationFormData = {};
  otherKeys.forEach( key => {
    sortedSharedData[ key ] = sharedTranslationFormData[ key ];
  } );
  a11yKeys.forEach( key => {
    sortedSharedData[ key ] = sharedTranslationFormData[ key ];
  } );

  logger.info( 'returning shared translation form data' );
  return sharedTranslationFormData;
};

export default getSharedTranslationFormData;