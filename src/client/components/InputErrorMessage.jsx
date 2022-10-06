// Copyright 2022, University of Colorado Boulder

import { useContext } from 'react';
import { ErrorContext } from './TranslationForm.jsx';

/* eslint-disable react/prop-types */

const InputErrorMessage = () => {
  const divStyle = {
    color: 'red'
  };

  /*
  touched: {
    simSpecific: {
      pH: { translated: true }
  */
  // TODO: Change conditional to reflect true shape of errors and touched objects.
  const error = useContext( ErrorContext );
  let jsx;
  if ( Object.keys( error ).length > 0 ) {
    jsx = <div style={divStyle}>Error: {JSON.stringify( error )}</div>;
  }
  else {
    jsx = null;
  }
  return jsx;
};

export default InputErrorMessage;