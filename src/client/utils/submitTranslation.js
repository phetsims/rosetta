// Copyright 2022, University of Colorado Boulder

/**
 * Submit a translation for publication to the PhET website.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import clientConstants from './clientConstants.js';
import computeNumStringsTranslated from './computeNumStringsTranslated.js';
import KeyTypesEnum from './KeyTypesEnum.js';
import makeTranslationObject from './makeTranslationObject.js';

/**
 * Issue a post request to submit a translation for publication to the PhET website.
 *
 * @param {Object} values - the values in the translation form
 * @param {String} simName - the name of the sim being translated
 * @param {String} locale - the locale code of the sim being translated
 */
const submitTranslation = async ( values, simName, locale ) => {
  console.log( `values = ${JSON.stringify( values, null, 4 )}` );
  const numStringsTranslated = computeNumStringsTranslated( values );
  const translation = await makeTranslationObject( values, simName, locale );
  const messages = {};
  for ( const keyType of Object.values( KeyTypesEnum ) ) {
    if ( numStringsTranslated[ keyType ] !== undefined ) {
      messages[ keyType ] = `You have ${numStringsTranslated[ keyType ]} ${keyType} string(s) translated.\n`;
    }
  }
  let confirmMessage = `For ${translation.simName} in locale ${translation.locale}:\n`;
  for ( const message of Object.keys( messages ) ) {
    confirmMessage += '    ' + messages[ message ];
  }
  confirmMessage += 'Are you sure you want to submit?';
  if ( window.confirm( confirmMessage ) ) {
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