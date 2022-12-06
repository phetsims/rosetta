// Copyright 2022, University of Colorado Boulder

/**
 * Create a set of buttons to be used in the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Return the set of buttons used in the translation form. These appear above and below the translation form.
 *
 * @param props
 * @returns {JSX.Element}
 */
const TranslationFormButtons = props => {
  const disabled = !( props.isValid && props.dirty );
  const grayButton = 'btn btn-secondary mt-2';
  const blueButton = 'btn btn-primary mt-2';
  const buttonClass = !( props.isValid && props.dirty ) ? grayButton : blueButton;
  return (
    <div>
      <div className='mt-2'>
        <button
          id='save'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
        >
          Save Translation to Work On Later
        </button>
      </div>
      <div className='mt-2'>
        <button
          id='submit'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
        >
          Publish Translation to PhET Website
        </button>
      </div>
      <div className='mt-2'>
        <button
          id='test'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
        >
          Test Translation With Your Strings
        </button>
      </div>
    </div>
  );
};

export default TranslationFormButtons;