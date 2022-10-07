// Copyright 2022, University of Colorado Boulder

import * as Yup from 'yup';

const makeValidationSchema = translationFormData => {
  let validationSchema;
  try {
    const simSpecificKeys = Object.keys( translationFormData.simSpecific ).map(
      key => key.split( '_DOT_' ).join( '.' )
    );
    const simSpecificValidationObject = {};
    for ( const key of simSpecificKeys ) {
      simSpecificValidationObject[ key ] = Yup.object( {
        translated: Yup.string().required()
      } );
    }
    const commonKeys = Object.keys( translationFormData.common ).map(
      key => key.split( '_DOT_' ).join( '.' )
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