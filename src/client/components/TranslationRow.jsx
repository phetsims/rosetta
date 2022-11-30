// Copyright 2021, University of Colorado Boulder

import { useField } from 'formik';
import React, { useContext } from 'react';
import InputErrorMessage from './InputErrorMessage.jsx';
import { LocaleInfoContext } from './RosettaRoutes.jsx';

/**
 * This component is a row in the translation table. It has the string key, the English string, and an input for
 * translating the English string.
 *
 * @param {Object} props - the props passed to this component
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationRow = props => {

  const localeInfo = useContext( LocaleInfoContext );
  const direction = localeInfo[ props.locale ].direction;
  const inputStyle = {
    textAlign: direction === 'rtl' ? 'right' : 'left'
  };

  // formik has a handful of props that it needs on inputs
  // get field props for the input
  const [ field ] = useField( props );

  return (
    <tr>
      <td>{props.stringKey}</td>
      <td>{props.englishString}</td>

      {/* use the spread operator to give the input each of the props in the field object */}
      <td>
        <input {...field} style={inputStyle} dir={direction}/>
        <InputErrorMessage fieldKey={props.keyWithoutDots}/>
      </td>
    </tr>
  );
};

export default TranslationRow;