// Copyright 2022, University of Colorado Boulder

/**
 * Use the Yup library to create a validation schema for our translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

/* eslint-disable prefer-arrow-callback */

import * as Yup from 'yup';
import { DOUBLE_BRACE_REGEX, SINGLE_BRACE_REGEX } from '../../common/constants';
import KeyTypesEnum from '../../common/KeyTypesEnum';
import { TranslationFormData } from '../../common/TranslationFormData.js';
import alertErrorMessage from './alertErrorMessage';
import isValidBracePattern from './isValidBracePattern';

type ValidationSubObjects = Record<string, Record<string, Yup.AnyObjectSchema>>;

/**
 * Return a Yup schema for validating our Formik translation form.
 */
const makeValidationSchema = (
  simRepoName: string,
  translationFormData: TranslationFormData
): Yup.AnyObjectSchema | { error: string } => {
  const subObjects: ValidationSubObjects = {};
  let validationSchema: Yup.AnyObjectSchema | { error: string };

  try {
    // We need to iterate over all types of keys.
    for ( const keyType of Object.values( KeyTypesEnum ) ) {
      // We have to replace dots in string keys with _DOT_. Otherwise, we might have errors related to the code think
      // there are more deeply nested objects than there really are.
      const stringKeys = Object.keys( translationFormData[ keyType ] ).map(
        key => key.split( '.' ).join( '_DOT_' )
      );

      subObjects[ keyType ] = {};
      for ( const stringKey of stringKeys ) {
        // If this is the sim title, add a validator indicating that it is required.
        if ( keyType === KeyTypesEnum.SIM_SPECIFIC && stringKey === `${simRepoName}_DOT_title` ) {
          subObjects[ keyType ][ stringKey ] = Yup.object( {
            translated: Yup.string().required( 'A translated title is required.' )
          } );
        }
        else {
          // Check if this string contains template patterns and, if so, add validation for them.
          const englishValue = translationFormData[ keyType ][ stringKey ].english;
          const englishSingleBraces = englishValue.match( SINGLE_BRACE_REGEX ) || [];
          const englishDoubleBraces = englishValue.match( DOUBLE_BRACE_REGEX ) || [];
          if ( englishSingleBraces.length > 0 || englishDoubleBraces.length > 0 ) {
            // We need to use a regular function here. Yup needs to be able to access the global "this" keyword, and if
            // you use an anonymous arrow function, it can't do that.
            const placeholderErrorMessage = 'Curly brace pattern does not match English version.';
            subObjects[ keyType ][ stringKey ] = Yup.object( {
              translated: Yup.string().test( 'validBracePattern', placeholderErrorMessage, function foo( value ) {
                return isValidBracePattern( value!, englishValue );
              } )
            } );
          }
        }
      }
    }

    const validationObject = {
      simSpecific: Yup.object( subObjects.simSpecific || {} ),
      shared: Yup.object( subObjects.shared || {} ),
      common: Yup.object( subObjects.common || {} )
    };

    validationSchema = Yup.object().shape( validationObject );
  }
  catch( e ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    alertErrorMessage( e as string );
    validationSchema = { error: 'unable to make validation schema' };
  }

  return validationSchema;
};

export default makeValidationSchema;