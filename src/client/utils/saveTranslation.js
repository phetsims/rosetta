// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import makeTranslationObject from './makeTranslationObject.js';

const saveTranslation = async ( values, simName, locale ) => {
  const translation = await makeTranslationObject( values, simName, locale );
  if ( window.confirm( `If you have a translation saved for ${translation.simName} in locale ${translation.locale}, it will be overwritten.` ) ) {
    try {
      await axios.post( '/translationApi/saveTranslation', translation );
      alert( 'Translation saved.' );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }
};

export default saveTranslation;