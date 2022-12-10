// Copyright 2022, University of Colorado Boulder

import KeyTypesEnum from './KeyTypesEnum.js';

/**
 * Compute the number of strings translated in the translation form. To be presented to user
 * before they submit their translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const computeNumStringsTranslated = translationValues => {
  const numStringsTranslated = {};
  for ( const keyType of Object.values( KeyTypesEnum ) ) {
    console.log( keyType );
    if ( translationValues[ keyType ] ) {
      console.log( 'here' );
      const stringKeysList = Object.keys( translationValues[ keyType ] );
      if ( stringKeysList.length > 0 ) {
        let count = 0;
        for ( const stringKey of stringKeysList ) {
          if ( translationValues[ keyType ][ stringKey ].translated !== '' ) {
            count++;
          }
        }
        numStringsTranslated[ keyType ] = count;
      }
    }
  }
  return numStringsTranslated;
};

export default computeNumStringsTranslated;