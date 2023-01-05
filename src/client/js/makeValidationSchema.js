// Copyright 2022, University of Colorado Boulder

/**
 * Use the Yup library to create a validation schema for our translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/* eslint-disable prefer-arrow-callback */

import * as Yup from 'yup';
import alertErrorMessage from './alertErrorMessage.js';
import isValidBracePattern from './isValidBracePattern.js';
import publicConfig from '../../common/publicConfig.js';
import KeyTypesEnum from '../../common/KeyTypesEnum.js';

/**
 * Return a Yup schema for validating our Formik translation form.
 *
 * @param {Object} translationFormData - data we use to populate the translation form
 * @returns {Object} - the validation schema
 */
const makeValidationSchema = translationFormData => {
  const subObjects = {};
  let validationSchema;

  // We need to iterate over both types of keys.
  try {
    for ( const keyType of Object.values( KeyTypesEnum ) ) {

      // We have to replace dots in string keys with _DOT_. Otherwise,
      // we might have errors related to the code think there are more
      // deeply nested objects than there really are.
      const keys = Object.keys( translationFormData[ keyType ] ).map(
        key => key.split( '.' ).join( '_DOT_' )
      );
      subObjects[ keyType ] = {};
      for ( const key of keys ) {
        const englishValue = translationFormData[ keyType ][ key ].english;
        const englishSingleBraces = englishValue.match( publicConfig.singleBraceRegex ) || [];
        const englishDoubleBraces = englishValue.match( publicConfig.doubleBraceRegex ) || [];
        if ( englishSingleBraces.length > 0 || englishDoubleBraces.length > 0 ) {

          // We need to use a regular function here. Yup needs to be able to access the global "this" keyword, and if
          // you use an anonymous arrow function, it can't do that. (Take this with a grain of salt, I wrote this
          // comment a while after I implemented this.)
          const placeholderErrorMessage = 'Curly brace pattern does not match English version.';
          subObjects[ keyType ][ key ] = Yup.object( {
            translated: Yup.string().test( 'validBracePattern', placeholderErrorMessage, function foo( value ) {
              return isValidBracePattern( value, englishValue );
            } )
          } );
        }
      }
    }
    const validationObject = {
      simSpecific: Yup.object( subObjects.simSpecific ),
      shared: Yup.object( subObjects.shared ),
      common: Yup.object( subObjects.common )
    };
    validationSchema = Yup.object().shape( validationObject );
  }
  catch( e ) {
    alertErrorMessage( e );
    validationSchema = { error: 'unable to make validation schema' };
  }
  return validationSchema;
};

export default makeValidationSchema;