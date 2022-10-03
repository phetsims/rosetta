// Copyright 2021, University of Colorado Boulder

/* eslint-disable react/prop-types */

import React from 'react';
import { useField } from 'formik';
import InputErrorMessage from './InputErrorMessage.jsx';
import { useEffect } from 'react';

/**
 * This component is a row in the translation table. It has the string key, the English string, and an input for
 * translating the English string.
 *
 * @param {Object} props - the props passed to this component
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationRow = props => {

  // formik has a handful of props that it needs on inputs
  // get field props for the input
  const [ field ] = useField( props );

  // re-render if there are errors
  useEffect( () => {
    if ( Object.keys( props.errors ) > 0 ) {
      console.error( props.errors );
    }
  }, [ props.errors ] );

  return (
    <tr>
      <td>{props.stringKey}</td>
      <td>{props.englishString}</td>

      {/* use the spread operator to give the input each of the props in the field object */}
      <td><input {...field}/></td>
      <InputErrorMessage {...props} fieldKey={props.key}/>
    </tr>
  );
};

export default TranslationRow;