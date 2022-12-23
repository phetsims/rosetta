// Copyright 2021, University of Colorado Boulder

/**
 * Define the component for a table row in the translation form table.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useField, useFormikContext } from 'formik';
import React, { useContext } from 'react';
import InputErrorMessage from './InputErrorMessage.jsx';
import { LocaleInfoContext } from './RosettaRoutes.jsx';
import boxArrowInRight from '../img/box-arrow-in-right.svg';

/**
 * This component is a row in the translation table. It has the string key, the English string, and an input for
 * translating the English string.
 *
 * @param {Object} props - the props passed to this component
 * @returns {JSX.Element}
 */
const TranslationFormRow = props => {

  const localeInfo = useContext( LocaleInfoContext );
  const direction = localeInfo[ props.locale ].direction;
  const inputStyle = {
    textAlign: direction === 'rtl' ? 'right' : 'left'
  };

  // Formik has a handful of props that it needs on inputs.
  // Get field props for the input.
  const [ field ] = useField( props );

  const { setFieldValue } = useFormikContext();

  const handleCopyButtonClick = () => {
    setFieldValue( field.name, props.englishString );
  };

  const buttonStyle = {
    border: '0.5px solid',
    marginRight: '6px',
    padding: '1px 3px 1px 2px'
  };

  return (
    <tr>
      <td>{props.stringKey}</td>
      <td>{props.englishString}</td>

      {/* Use the spread operator to give the input each of the props in the field object. */}
      <td>
        <button style={buttonStyle} className='btn btn-light' type='button' onClick={handleCopyButtonClick}>
          <img src={boxArrowInRight} alt='copy English value to input icon'/>
        </button>
        <input {...field} style={inputStyle} dir={direction}/>
        <InputErrorMessage fieldKey={props.keyWithoutDots}/>
      </td>
    </tr>
  );
};

export default TranslationFormRow;