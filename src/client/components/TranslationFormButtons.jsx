// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/prop-types */

import saveTranslation from '../utils/saveTranslation.js';
import submitTranslation from '../utils/submitTranslation.js';
import testTranslation from '../utils/testTranslation.js';

// TODO: The values we get in onClick aren't the translation form values.
// TODO: We need to find another way to do this.
// TODO: Set some sort of flag or reference on each button, then in the handleSubmit, use conditional logic.
// TODO: https://reactjs.org/docs/lifting-state-up.html
// TODO: Maybe useRef will help?

const TranslationFormButtons = props => {
  return (
    <div>
      <div className='mt-2'>
        <button onClick={async values => {
          console.log( props.simName );
          console.log( props.locale );
          await saveTranslation( values, props.simName, props.locale );
        }} className='btn btn-primary'>
          Save Translation
        </button>
      </div>
      <div className='mt-2'>
        <button onClick={async values => {
          await submitTranslation( values, props.simName, props.locale );
        }} className='btn btn-primary'>
          Submit Translation
        </button>
      </div>
      <div className='mt-2'>
        <button onClick={async values => {
          await testTranslation( values, props.simName, props.locale );
        }} className='btn btn-primary'>
          Test Translation
        </button>
      </div>
    </div>
  );
};

export default TranslationFormButtons;