// Copyright 2022, University of Colorado Boulder

import { useContext } from 'react';
import { ErrorContext } from './TranslationForm.jsx';

const InputErrorMessage = ( { fieldKey } ) => {
  const divStyle = {
    color: 'red'
  };
  const error = useContext( ErrorContext );
  let jsx = null;
  if ( Object.keys( error ).length > 0 ) {
    if (
      error.simSpecific &&
      error.simSpecific[ fieldKey ] &&
      error.simSpecific[ fieldKey ].translated
    ) {
      const errorMessage = error.simSpecific[ fieldKey ].translated;
      jsx = <div style={divStyle}>{errorMessage}</div>;
    }
    else if (
      error.common &&
      error.common[ fieldKey ] &&
      error.common[ fieldKey ].translated
    ) {
      const errorMessage = error.common[ fieldKey ].translated;
      jsx = <div style={divStyle}>{errorMessage}</div>;
    }
  }
  return jsx;
};

export default InputErrorMessage;