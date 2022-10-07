// Copyright 2022, University of Colorado Boulder

import * as Yup from 'yup';

const SINGLE_BRACE_REGEX = /\{\d+\}/g;

//const DOUBLE_BRACE_REGEX = /\{\{\w+\}\}/g;

const makeValidationSchema = translationFormData => {
  let validationSchema;
  try {
    const simSpecificKeys = Object.keys( translationFormData.simSpecific ).map(
      key => key.split( '.' ).join( '_DOT_' )
    );
    const simSpecificValidationObject = {};
    for ( const key of simSpecificKeys ) {
      const englishValue = translationFormData.simSpecific[ key ].english;
      if ( SINGLE_BRACE_REGEX.test( englishValue ) ) {
        simSpecificValidationObject[ key ] = Yup.object( {
          translated: Yup.string().matches( SINGLE_BRACE_REGEX, 'Must have braces' )
        } );
      }
    }
    const commonKeys = Object.keys( translationFormData.common ).map(
      key => key.split( '.' ).join( '_DOT_' )
    );
    const commonValidationObject = {};
    for ( const key of commonKeys ) {
      commonValidationObject[ key ] = Yup.object( {
        translated: Yup.string().required()
      } );
    }
    const validationObject = {
      simSpecific: Yup.object( simSpecificValidationObject ),
      common: Yup.object( commonValidationObject )
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