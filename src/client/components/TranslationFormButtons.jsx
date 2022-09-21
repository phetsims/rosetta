// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/prop-types */

// TODO: The values we get in onClick aren't the translation form values.
// TODO: We need to find another way to do this.
// TODO: Set some sort of flag or reference on each button, then in the handleSubmit, use conditional logic.
// TODO: https://reactjs.org/docs/lifting-state-up.html
// TODO: Maybe useRef will help?

const TranslationFormButtons = props => {
  return (
    <div>
      <div className='mt-2'>
        <button id='save' onClick={props.handleButtonClick} className='btn btn-primary'>
          Save Translation
        </button>
      </div>
      <div className='mt-2'>
        <button id='submit' onClick={props.handleButtonClick} className='btn btn-primary'>
          Submit Translation
        </button>
      </div>
      <div className='mt-2'>
        <button id='test' onClick={props.handleButtonClick} className='btn btn-primary'>
          Test Translation
        </button>
      </div>
    </div>
  );
};

export default TranslationFormButtons;