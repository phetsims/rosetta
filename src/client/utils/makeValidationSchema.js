// Copyright 2022, University of Colorado Boulder

import * as Yup from 'yup';
import isValidBracePattern from './isValidBracePattern.js';

function validBracePattern( message, englishValue ) {

  // value here is the translated value.
  return this.test( 'validBracePattern', message, value => {
    return isValidBracePattern( value, englishValue );
  } );
}

Yup.addMethod( Yup.string, 'validBracePattern', validBracePattern );

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
        if ( englishValue.includes( '{' ) && englishValue.includes( '}' ) ) {
          subObjects[ keyType ][ key ] = Yup.object( {
            translated: Yup.string().validBracePattern( 'Hello', englishValue )
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