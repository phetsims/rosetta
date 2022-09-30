// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/prop-types */

const TranslationFormButtons = ( { handleButtonClick, isValid, dirty } ) => {
  const grayButton = 'btn btn-secondary mt-2';
  const blueButton = 'btn btn-primary mt-2';
  console.log( `isValid = ${isValid}` );
  return (
    <div>
      <div className='mt-2'>
        <button
          id='save'
          onClick={handleButtonClick}
          disabled={!( isValid && dirty )}
          className={!( isValid && dirty ) ? grayButton : blueButton}
        >
          Save Translation
        </button>
      </div>
      <div className='mt-2'>
        <button
          id='submit'
          onClick={handleButtonClick}
          disabled={!( isValid && dirty )}
          className={!( isValid && dirty ) ? grayButton : blueButton}
        >
          Submit Translation
        </button>
      </div>
      <div className='mt-2'>
        <button
          id='test'
          onClick={handleButtonClick}
          disabled={!( isValid && dirty )}
          className={!( isValid && dirty ) ? grayButton : blueButton}
        >
          Test Translation
        </button>
      </div>
    </div>
  );
};

export default TranslationFormButtons;