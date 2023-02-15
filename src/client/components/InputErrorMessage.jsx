// Copyright 2022, University of Colorado Boulder

/**
 * Create an error message to be displayed underneath an invalid input in the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import KeyTypesEnum from '../../common/KeyTypesEnum.js';
import { ErrorContext } from './TranslationForm.jsx';
import questionOctagon from '../img/question-octagon.svg';

// eslint-disable-next-line bad-text
import '../styles/input-error.css';

/**
 * This component is a small error message to be displayed underneath an invalid input in the translation form.
 *
 * @param {String} fieldKey - the key for the Formik field (i.e. the input)
 * @returns {JSX.Element}
 */
const InputErrorMessage = ( { fieldKey } ) => {
  const tooltip = 'Curly brace patterns must match the English version. ' +
                  'The values inside of the curly braces must also match the English version. ' +
                  'These curly brace patterns are values that dynamically change in the sim.\n\n' +
                  'For example, {0}: {1} cannot be translated to {x}: {y}. ' +
                  'However, the order of the {0} and the {1} can change. ' +
                  'So {0}: {1} could be translated to {1}: {0}.\n\n' +
                  'The text outside the curly braces can be changed. ' +
                  'For example, Software Development: {0} could be translated to Software Dev: {0}.\n\n' +
                  'The rules above apply to string keys with double curly braces as well.\n\n' +
                  'For further guidance, please read the user guide.';
  const errorTooltipJsx = (
    <button
      onClick={() => window.alert( tooltip )}
      type='button'
      className='btn btn-danger error-button'
      data-bs-toggle='tooltip'
      data-bs-placement='top'
      title={tooltip}>
      <img src={questionOctagon} alt='question icon'/>
    </button>
  );
  const error = useContext( ErrorContext );
  let jsx = null;
  if ( Object.keys( error ).length > 0 ) {
    for ( const keyType of Object.values( KeyTypesEnum ) ) {
      if (
        error[ keyType ] &&
        error[ keyType ][ fieldKey ] &&
        error[ keyType ][ fieldKey ].translated
      ) {
        const errorMessage = error[ keyType ][ fieldKey ].translated;
        jsx = (
          <>
            {errorTooltipJsx}
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