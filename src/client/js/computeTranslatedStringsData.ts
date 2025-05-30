// Copyright 2022, University of Colorado Boulder

/**
 * Compute the number of strings translated in the translation form. To be presented to user
 * before they submit their translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import KeyTypesEnum from '../../common/KeyTypesEnum';
import { TranslationFormData } from '../../common/TranslationFormData.js';

type TranslatedStringsData = {
  [ key: string ]: {
    name: string;
    translated: number;
    total: number;
  };
};

/**
 * Return an object with data about the translated strings in a translation form.
 */
const computeTranslatedStringsData = ( translationValues: TranslationFormData ): TranslatedStringsData => {
  const translatedStringsData: TranslatedStringsData = {};
  for ( const keyType of Object.values( KeyTypesEnum ) ) {
    if ( translationValues[ keyType ] ) {
      translatedStringsData[ keyType ] = {
        name: '',
        translated: 0,
        total: 0
      };

      // Set names for the data.
      if ( keyType === 'simSpecific' ) {
        translatedStringsData[ keyType ].name = 'sim specific';
      }
      else if ( keyType === 'shared' ) {
        translatedStringsData[ keyType ].name = 'shared';
      }
      else if ( keyType === 'common' ) {
        translatedStringsData[ keyType ].name = 'common';
      }

      // Get number of translated and total number of strings.
      const stringKeysList = Object.keys( translationValues[ keyType ] );
      translatedStringsData[ keyType ].total = stringKeysList.length;
      if ( stringKeysList.length > 0 ) {
        let translatedStringsCount = 0;
        for ( const stringKey of stringKeysList ) {
          if ( translationValues[ keyType ][ stringKey ].translated !== '' ) {
            translatedStringsCount++;
          }
        }
        translatedStringsData[ keyType ].translated = translatedStringsCount;
      }
      else {
        // If there aren't any string keys for a given key type, set translated to 0.
        // Thus, you'd get a message like "0 of 0 {key type} strings translated".
        translatedStringsData[ keyType ].translated = 0;
      }
    }
  }
  return translatedStringsData;
};

export default computeTranslatedStringsData;