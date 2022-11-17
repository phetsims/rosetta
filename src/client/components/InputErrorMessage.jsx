// Copyright 2022, University of Colorado Boulder

/**
 * Create an error message to be displayed underneath an invalid input in the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { ErrorContext } from './TranslationForm.jsx';

/**
 * This component is a small error message to be displayed underneath an invalid input in the translation form.
 *
 * @param {String} fieldKey - the key for the Formik field (i.e. the input)
 * @returns {JSX.Element}
 */
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