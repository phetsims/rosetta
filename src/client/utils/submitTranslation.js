// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import clientConstants from './clientConstants.js';
import makeTranslationObject from './makeTranslationObject.js';

const submitTranslation = async ( values, simName, locale ) => {
  const translation = await makeTranslationObject( values, simName, locale );
  if ( window.confirm( `Are you sure you want to submit your translation for ${translation.simName} in locale ${translation.locale}?` ) ) {
    try {
      await axios.post( `${clientConstants.translationApiRoute}/submitTranslation`, translation );
      const submissionMessage = 'Translation submitted. ' +
                                'Your translation should appear on the PhET website in about half an hour.' +
                                'It will take about 10 minutes for the translation utility to show the changes you made.';
      alert( submissionMessage );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }
};

export default submitTranslation;