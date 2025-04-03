// Copyright 2022, University of Colorado Boulder

/**
 * Create a set of buttons to be used in the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import LoadingSpinner from './LoadingSpinner.jsx';
import '../styles/translation-form.css';

/**
 * Return the set of buttons used in the translation form. These appear above and below the translation form.
 *
 * @param props
 * @returns {JSX.Element}
 */
const TranslationFormButtons = props => {
  const disabled = !( props.isValid && props.dirty ) || props.isDisabled;
  const grayButton = 'btn btn-secondary';
  const blueButton = 'btn btn-primary';
  const buttonClass = !( props.isValid && props.dirty ) ? grayButton : blueButton;
  const automateButtonClass = 'btn btn-success';
  return (
    <div className='card sticky-top mt-4 mb-4'>
      <div className='card-body save-test-publish-buttons-container'>
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
        {props.testIsLoading ? <LoadingSpinner/> : <></>}
      </div>
    </div>
  );
};

export default TranslationFormButtons;