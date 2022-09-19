// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import makeTranslationObject from './makeTranslationObject.js';

const saveTranslation = async ( values, simName, locale ) => {
  const translation = await makeTranslationObject( values, simName, locale );
  if ( window.confirm( `If you have a translation saved for ${translation.simName} in locale ${translation.locale}, it will be overwritten.` ) ) {
    try {
      const postRes = await axios.post( '/translationApi/saveTranslation', translation );
      console.log( postRes.data );
      alert( 'Translation saved.' );
    }
    catch( e ) {
      console.error( e );
    }
  }
};

export default saveTranslation;