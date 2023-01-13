// Copyright 2022, University of Colorado Boulder

/**
 * Create a set of buttons to be used in the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Return the set of buttons used in the translation form. These appear above and below the translation form.
 *
 * @param props
 * @returns {JSX.Element}
 */
const TranslationFormButtons = props => {
  const divStyle = {
    display: 'flex',
    flexFlow: 'row wrap'
  };
  const disabled = !( props.isValid && props.dirty ) || props.isDisabled;
  const margin = {
    marginTop: '20px',
    marginBottom: '20px',
    marginRight: '20px'
  };
  const grayButton = 'btn btn-secondary';
  const blueButton = 'btn btn-primary';
  const buttonClass = !( props.isValid && props.dirty ) ? grayButton : blueButton;
  return (
    <div style={divStyle}>
      <button
        id='save'
        onClick={props.handleButtonClick}
        disabled={disabled}
        className={buttonClass}
        style={margin}
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
        style={margin}
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
        style={margin}
        data-bs-toggle='tooltip'
        data-bs-placement='top'
        title='Test the simulation with your translated strings'
      >
        Test
      </button>
      {props.testIsLoading ? <LoadingSpinner/> : <></>}
    </div>
  );
};

export default TranslationFormButtons;