// Copyright 2021, University of Colorado Boulder

/* eslint-disable react/prop-types */

import React from 'react';
import { useField } from 'formik';

const TranslationRow = props => {
  const [ field ] = useField( props );
  return (
    <tr>
      <td>{props.stringKey}</td>
      <td>{props.englishString}</td>
      <td><input {...field}/></td>
    </tr>
  );
};

export default TranslationRow;