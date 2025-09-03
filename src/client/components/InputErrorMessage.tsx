// Copyright 2022, University of Colorado Boulder

/**
 * Create an error message to be displayed underneath an invalid input in the translation form and potentially a button
 * with additional information.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import React, { ReactElement, useContext } from 'react';
import KeyTypesEnum from '../../common/KeyTypesEnum';
import questionOctagon from '../img/question-octagon.svg';
import { ErrorContext } from './TranslationForm';
import '../styles/input-error.css';

const CURLY_BRACE_INFO_MESSAGE = 'Curly brace patterns must match the English version. ' +
                                 'The values inside of the curly braces must also match the English version. ' +
                                 'These curly brace patterns are values that dynamically change in the sim.\n\n' +
                                 'For example, {0}: {1} cannot be translated to {x}: {y}. ' +
                                 'However, the order of the {0} and the {1} can change. ' +
                                 'So {0}: {1} could be translated to {1}: {0}.\n\n' +
                                 'The text outside the curly braces can be changed. ' +
                                 'For example, Software Development: {0} could be translated to Software Dev: {0}.\n\n' +
                                 'The rules above apply to string keys with double curly braces as well.\n\n' +
                                 'For further guidance, please read the user guide.';

type InputErrorMessageProps = {
  fieldKey: string;
  isPatternString: boolean;
};

type ErrorType = Record<string, Record<string, {
  translated?: string;
}>>;

const InputErrorMessage: React.FC<InputErrorMessageProps> = ( { fieldKey, isPatternString } ): ReactElement | null => {

  const additionalInfoButton = (
    <button
      onClick={() => window.alert( CURLY_BRACE_INFO_MESSAGE )}
      type='button'
      className='btn btn-danger error-button'
      data-bs-toggle='tooltip'
      data-bs-placement='top'
      title={CURLY_BRACE_INFO_MESSAGE}>
      <img src={questionOctagon} alt='question icon'/>
    </button>
  );

  const error = useContext( ErrorContext ) as ErrorType | null;
  let jsx: ReactElement | null = null;

  if ( error && Object.keys( error ).length > 0 ) {
    for ( const keyType of Object.values( KeyTypesEnum ) ) {
      if (
        error[ keyType ] &&
        error[ keyType ][ fieldKey ] &&
        error[ keyType ][ fieldKey ].translated
      ) {
        const errorMessage = error[ keyType ][ fieldKey ].translated;
        jsx = (
          <>
            {/*include the button with info about curly brace patterns if the field is such a pattern*/}
            {isPatternString ? additionalInfoButton : <></>}
            <div className='error-container'>
              {errorMessage}
            </div>
          </>
        );
      }
    }
  }
  return jsx;
};

export default InputErrorMessage;