// Copyright 2022, University of Colorado Boulder

/**
 * Create a set of buttons to be used in the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import '../styles/translation-form.css';

// TODO: Should this be in the ClientDataTypes file? https://github.com/phetsims/rosetta/issues/370
type TranslationFormButtonsProps = {
  simName: string;
  locale: string;
  isValid: boolean;
  dirty: boolean;
  isDisabled: boolean;
  testIsLoading: boolean;
  hideTranslated: boolean;
  setHideTranslated: ( hide: boolean ) => void;
  handleButtonClick: ( event: React.MouseEvent<HTMLButtonElement> ) => void;
};

/**
 * Return the set of buttons used in the translation form. These appear above and below the translation form.
 */
const TranslationFormButtons: React.FC<TranslationFormButtonsProps> = props => {
  // const loginState = useContext( LoginStateContext );
  // const showAutomate = loginState.isTeamMember; // Only show automation feature if user is a team member
  const showAutomate = false; // TODO: For now, we are not showing the automate button in the UI, https://github.com/phetsims/rosetta/issues/451
  const disabled = !( props.isValid && props.dirty ) || props.isDisabled;
  const grayButton = 'btn btn-secondary';
  const blueButton = 'btn btn-primary';
  const buttonClass = !( props.isValid && props.dirty ) ? grayButton : blueButton;
  const automateButtonClass = 'btn btn-success';

  return (
    <div className='card sticky-top mt-4 mb-4'>
      <div className='card-body save-test-publish-buttons-container d-flex align-items-center flex-wrap'>
        <button
          id='save'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
          data-bs-toggle='tooltip'
          data-bs-placement='top'
          title='Save your translation to work on later'
        >
          Save
        </button>
        <button
          id='submit'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
          data-bs-toggle='tooltip'
          data-bs-placement='top'
          title='Publish your translation to the PhET website'
        >
          Publish
        </button>
        <button
          id='test'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
          data-bs-toggle='tooltip'
          data-bs-placement='top'
          title='Test the simulation with your translated strings'
        >
          Test
        </button>
        {showAutomate && (
          <button
            id='automate'
            onClick={props.handleButtonClick}
            disabled={disabled}
            className={automateButtonClass}
            data-bs-toggle='tooltip'
            data-bs-placement='top'
            title='Automate the translation with machine translation'
          >
            Automate (Experimental)
          </button>
        )}
        {props.testIsLoading ? <LoadingSpinner/> : <></>}
        <div className='ms-auto'>
          <label className='form-check-label'>
            <input
              type='checkbox'
              className='form-check-input me-2'
              checked={props.hideTranslated}
              onChange={event => props.setHideTranslated( event.target.checked )}
            />
            Hide translated strings
          </label>
        </div>
      </div>
    </div>
  );
};

export default TranslationFormButtons;