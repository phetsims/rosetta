// Copyright 2022, University of Colorado Boulder

/**
 * Submit a translation for publication to the PhET website.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import clientConstants from './clientConstants.js';
import makeTranslationObject from './makeTranslationObject.js';

/**
 * Issue a post request to submit a translation for publication to the PhET website.
 *
 * @param {Object} values - the values in the translation form
 * @param {String} simName - the name of the sim being translated
 * @param {String} locale - the locale code of the sim being translated
 */
const submitTranslation = async ( values, simName, locale ) => {
  const translation = await makeTranslationObject( values, simName, locale );
  if ( window.confirm( `Are you sure you want to submit your translation for ${translation.simName} in locale ${translation.locale}?` ) ) {
    try {
      await axios.post( `${clientConstants.translationApiRoute}/submitTranslation`, translation );
      const submissionMessage = 'Translation submitted. ' +
                                'Your translation should appear on the PhET website in about half an hour. ' +
                                'It will take about 10 minutes for the translation utility to show the changes you made.';
      alert( submissionMessage );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }
};

export default submitTranslation;