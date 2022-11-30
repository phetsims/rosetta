// Copyright 2022, University of Colorado Boulder

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
          Save Translation
        </button>
      </div>
      <div className='mt-2'>
        <button
          id='submit'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
        >
          Submit Translation
        </button>
      </div>
      <div className='mt-2'>
        <button
          id='test'
          onClick={props.handleButtonClick}
          disabled={disabled}
          className={buttonClass}
        >
          Test Translation
        </button>
      </div>
    </div>
  );
};

export default TranslationFormButtons;