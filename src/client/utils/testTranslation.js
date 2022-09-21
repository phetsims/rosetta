// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import makeTranslationObject from './makeTranslationObject.js';

const testTranslation = async ( values, simName, locale ) => {
  const translation = await makeTranslationObject( values, simName, locale );
  try {
    const testRes = await axios.post( '/translationApi/testTranslation', translation );
    const stringSimHtml = testRes.data;

    // Open the translated sim in a new tab.
    const win = window.open( '' );
    win.document.write( stringSimHtml );
  }
  catch( e ) {
    console.error( e );
  }
};

export default testTranslation;