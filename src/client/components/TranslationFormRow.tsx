// Copyright 2021, University of Colorado Boulder

/**
 * Define the component for a table row in the translation form table.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useField, useFormikContext } from 'formik';
import React, { ReactElement, useContext } from 'react';
import { DOUBLE_BRACE_REGEX, SINGLE_BRACE_REGEX } from '../../common/constants';
import '../styles/table.css';
import '../styles/translation-form.css';
import { TranslationFormRowProps } from '../ClientDataTypes';
import InputErrorMessage from './InputErrorMessage';
import { LocaleInfoContext } from './RosettaRoutes';

type TextAreaStyle = {
  textAlign: 'left' | 'right';
  color: string;
  resize: 'both';
};

/**
 * This component is a row in the translation table. It has the string key, the English string, and an input for
 * translating the English string.
 */
const TranslationFormRow: React.FC<TranslationFormRowProps> = ( props ): ReactElement => {

  const localeInfo = useContext( LocaleInfoContext );
  const direction = localeInfo[ props.locale ].direction;

  const singleBraceRegex = new RegExp( SINGLE_BRACE_REGEX );
  const doubleBraceRegex = new RegExp( DOUBLE_BRACE_REGEX );
  const isPatternString = singleBraceRegex.test( props.englishString ) ||
                          doubleBraceRegex.test( props.englishString );

  // If the English string contains either one of the supported curly brace patterns, color it differently
  const englishStringStyle = {
    color: isPatternString ? 'blue' : 'black'
  };

  const isA11yStringKey = props.stringKey.includes( 'a11y' );

  const stringKeyStyle = {
    fontStyle: isA11yStringKey ? 'italic' : 'normal'
  };

  // Determine if this field has a pending AI suggestion from form values
  const { setFieldValue } = useFormikContext();
  const objPath = props.name.replace( /\.translated$/, '' );
  const aiPending = props.aiTranslatedFields && props.aiTranslatedFields.has( props.name );

  // Determine text area styling, orange for AI pending, blue for pattern strings, otherwise black
  const textAreaStyle: TextAreaStyle = {
    textAlign: direction === 'rtl' ? 'right' : 'left',
    color: aiPending ? 'orange' : ( isPatternString ? 'blue' : 'black' ),
    resize: 'both' as const
  };

  // Formik has a handful of props that it needs on inputs.
  // Get field props for the input.
  const [ field ] = useField( props.name );

  // Check if this row had a translation when the form was loaded and should be hidden
  const hadInitialTranslation = field.value && field.value.trim() !== '';
  const shouldHide = props.hasTranslation && props.hideTranslated && hadInitialTranslation;

  // Handlers for AI validation actions
  const handleAiAccept = () => {
    const newSet = new Set( props.aiTranslatedFields );
    newSet.delete( props.name );
    props.setAiTranslatedFields( newSet );
  };
  const handleAiDeny = () => {
    // Clear the translation and the pending AI flag upon denial
    void setFieldValue( props.name, '' );
    void setFieldValue( `${objPath}.aiTranslated`, false );
  };

  const handleCopyButtonClick = () => {
    void setFieldValue( field.name, props.englishString );
  };

  return (
    <tr style={{ display: shouldHide ? 'none' : 'table-row' }}>
      <td style={stringKeyStyle}>{props.stringKey}</td>
      <td style={englishStringStyle}>{props.englishString}</td>

      {/* Use the spread operator to give the input each of the props in the field object. */}
      <td>
        <div className='copy-value-and-input-container'>
          <button className='btn btn-light' type='button' onClick={handleCopyButtonClick}>
            ➡️
          </button>
          <textarea
            {...field}
            style={textAreaStyle}
            dir={direction}
            onChange={e => {
              field.onChange( e );
              if ( aiPending ) {
                handleAiAccept();
              }
            }}
          />
          {aiPending && (
            <>
              <button type='button' className='btn btn-light' onClick={handleAiAccept}>✅</button>
              <button type='button' className='btn btn-light' onClick={handleAiDeny}>❌</button>
            </>
          )}
        </div>
        <InputErrorMessage fieldKey={props.keyWithoutDots} isPatternString={isPatternString}/>
      </td>
    </tr>
  );
};

export default TranslationFormRow;