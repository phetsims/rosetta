// Copyright 2022, University of Colorado Boulder

import * as Yup from 'yup';

const SINGLE_BRACE_REGEX = /\{\d+\}/g;
const DOUBLE_BRACE_REGEX = /\{\{\w+\}\}/g;

/*

TODO

(ノಠ益ಠ)ノ彡┻━┻
SOMEHOW there's a problem with this.

For example, in ab/energy-skate-park (at the very bottom of the translation form):

keyboardHelpDialog.grabOrReleaseHeadingPattern
  works

keyboardHelpDialog.grabOrReleaseLabelPattern
  doesn't work

*/

const makeValidationSchema = translationFormData => {
  const subObjects = {};
  let validationSchema;
  const typesOfKeys = [ 'simSpecific', 'common' ];
  try {
    for ( const keyType of typesOfKeys ) {
      const keys = Object.keys( translationFormData[ keyType ] ).map(
        key => key.split( '.' ).join( '_DOT_' )
      );
      subObjects[ keyType ] = {};
      for ( const key of keys ) {
        const englishValue = translationFormData[ keyType ][ key ].english;
        if ( SINGLE_BRACE_REGEX.test( englishValue ) ) {
          subObjects[ keyType ][ key ] = Yup.object( {
            translated: Yup.string().matches( SINGLE_BRACE_REGEX, 'Must have single brace pattern' )
          } );
        }
        else if ( DOUBLE_BRACE_REGEX.test( englishValue ) ) {
          subObjects[ keyType ][ key ] = Yup.object( {
            translated: Yup.string().matches( DOUBLE_BRACE_REGEX, 'Must have double brace pattern' )
          } );
        }
      }
    }
    const validationObject = {
      simSpecific: Yup.object( subObjects.simSpecific ),
      common: Yup.object( subObjects.common )
    };
    validationSchema = Yup.object().shape( validationObject );
  }
  catch( e ) {
    console.error( e );
    validationSchema = { error: 'unable to make validation schema' };
  }
  return validationSchema;
};

export default makeValidationSchema;