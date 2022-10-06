// Copyright 2022, University of Colorado Boulder

import { useContext } from 'react';
import { ErrorContext } from './TranslationForm.jsx';

/* eslint-disable react/prop-types */

const InputErrorMessage = props => {
  const divStyle = {
    color: 'red'
  };

  /*
  touched: {
    simSpecific: {
      pH: { translated: true }
  */
  // TODO: Change conditional to reflect true shape of errors and touched objects.
  // TODO: It seems like the state for the errors object isn't reaching this component?
  // TODO: Because of https://stackoverflow.com/questions/41233458/react-child-component-not-updating-after-parent-state-change?
  // TODO: Would something like this https://stackoverflow.com/a/41679634 help?
  // TODO: Using something like {...props} on parent components?
  // TODO: And https://formik.org/docs/api/useField?
  const error = useContext( ErrorContext );
  let jsx;
  if ( error ) {
    jsx = <div style={divStyle}>Error: {JSON.stringify( error )}</div>;
  }
  else {
    jsx = null;
  }
  return jsx;
};

export default InputErrorMessage;