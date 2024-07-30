// Copyright 2021, University of Colorado Boulder

/**
 * Define the component for a table row in the translation form table.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useField, useFormikContext } from 'formik';
import React, { useContext } from 'react';
import { DOUBLE_BRACE_REGEX, SINGLE_BRACE_REGEX } from '../../common/constants.js';
import boxArrowInRight from '../img/box-arrow-in-right.svg';
import '../styles/table.css';
import '../styles/translation-form.css';
import InputErrorMessage from './InputErrorMessage.jsx';
import { LocaleInfoContext } from './RosettaRoutes.jsx';

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

  const isPatternString = SINGLE_BRACE_REGEX.test( props.englishString ) ||
                          DOUBLE_BRACE_REGEX.test( props.englishString );

  // If the English string contains either one of the supported curly brace patterns, we want to color it differently
  // and make the text area text a different color to indicate that this is a special string that requires care.
  const englishStringStyle = {
    color: isPatternString ? 'blue' : 'black'
  };
  const textAreaStyle = {
    textAlign: direction === 'rtl' ? 'right' : 'left',
    color: isPatternString ? 'blue' : 'black',
    resize: 'both'
  };

  // Formik has a handful of props that it needs on inputs.
  // Get field props for the input.
  const [ field ] = useField( props );

  const { setFieldValue } = useFormikContext();

  const handleCopyButtonClick = () => {
    setFieldValue( field.name, props.englishString );
  };

  return (
    <tr>
      <td>{props.stringKey}</td>
      <td style={englishStringStyle}>{props.englishString}</td>

      {/* Use the spread operator to give the input each of the props in the field object. */}
      <td>
        <div className='copy-value-and-input-container'>
          <button className='copy-value-button btn btn-light' type='button' onClick={handleCopyButtonClick}>
            <img src={boxArrowInRight} alt='copy English value to input icon'/>
          </button>
          <textarea {...field} style={textAreaStyle} dir={direction}/>
        </div>
        <InputErrorMessage fieldKey={props.keyWithoutDots} isPatternString={isPatternString}/>
      </td>
    </tr>
  );
};

export default TranslationFormRow;