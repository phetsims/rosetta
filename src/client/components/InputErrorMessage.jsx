// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/prop-types */

import { useState } from 'react';
import { useEffect } from 'react';

const InputErrorMessage = props => {
  const divStyle = {
    color: 'red'
  };

  const [ error, setError ] = useState( props.errors );
  useEffect( () => {
    setError( props.errors );
  }, [ props.errors ] );

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
  // let jsx;
  // if ( props.errors ) {
  //   jsx = <div style={divStyle}>Error</div>;
  // }
  // else {
  //   jsx = null;
  // }
  // return jsx;
  return <div style={divStyle}>{JSON.stringify( error )}</div>;
};

export default InputErrorMessage;