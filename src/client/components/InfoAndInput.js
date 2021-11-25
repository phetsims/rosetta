// Copyright 2021, University of Colorado Boulder

/* eslint-disable react/prop-types */

import React from 'react';
import { useField } from 'formik';

const InfoAndInput = props => {
  const [ field ] = useField( props );
  return (
    <ul>
      <li>String Key: {props.stringKey}</li>
      <li>English String: {props.englishString}</li>
      <input
        {...field}
      />
    </ul>
  );
};

export default InfoAndInput;