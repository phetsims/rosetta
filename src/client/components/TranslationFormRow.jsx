// Copyright 2021, University of Colorado Boulder

/**
 * Define the component for a table row in the translation form table.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

// Disable this rule so we can import stylesheets.
/* eslint-disable bad-text */

import { useField, useFormikContext } from 'formik';
import React, { useContext } from 'react';
import InputErrorMessage from './InputErrorMessage.jsx';
import { LocaleInfoContext } from './RosettaRoutes.jsx';
import boxArrowInRight from '../img/box-arrow-in-right.svg';
import '../styles/table.css';
import '../styles/translation-form.css';
import publicConfig from '../../common/publicConfig.js';

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

  // If the English string contains one of the curly brace patterns (or both) we want
  // to color the English string and the text area text a different color to indicate
  // to the user this is a special string that requires care.
  const needsSpecialColoring = publicConfig.singleBraceRegex.test( props.englishString ) ||
                               publicConfig.doubleBraceRegex.test( props.englishString );
  const englishStringStyle = {
    color: needsSpecialColoring ? 'blue' : 'black'
  };
  const textAreaStyle = {
    textAlign: direction === 'rtl' ? 'right' : 'left',
    color: needsSpecialColoring ? 'blue' : 'black'
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
        <InputErrorMessage fieldKey={props.keyWithoutDots}/>
      </td>
    </tr>
  );
};

export default TranslationFormRow;