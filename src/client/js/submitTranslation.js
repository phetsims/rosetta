// Copyright 2022, University of Colorado Boulder

/**
 * Submit a translation for publication to the PhET website.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import publicConfig from '../../common/publicConfig.js';
import computeTranslatedStringsData from './computeTranslatedStringsData.js';
import KeyTypesEnum from './KeyTypesEnum.js';
import makeTranslationObject from './makeTranslationObject.js';

/**
 * Issue a post request to submit a translation for publication to the PhET website.
 *
 * @param {Object} values - the values in the translation form
 * @param {String} simName - the name of the sim being translated
 * @param {String} locale - the locale code of the sim being translated
 * @param {String} simTitle - the sim's title
 * @param {String} localeName - the name of the language/locale
 */
const submitTranslation = async (
  values,
  simName,
  locale,
  simTitle,
  localeName
) => {

  let submitted = false;
  const translatedStringsData = computeTranslatedStringsData( values );
  const translation = await makeTranslationObject( values, simName, locale );
  const messages = {};
  for ( const keyType of Object.values( KeyTypesEnum ) ) {
    if ( translatedStringsData[ keyType ].translated !== undefined ) {
      messages[ keyType ] = `You have ${translatedStringsData[ keyType ].translated}`
                            + ` of ${translatedStringsData[ keyType ].total}`
                            + ` ${translatedStringsData[ keyType ].name} string(s) translated.\n`;
    }
  }
  let confirmMessage = `For ${simTitle} in locale ${localeName}:\n`;
  for ( const message of Object.keys( messages ) ) {
    confirmMessage += '    ' + messages[ message ];
  }
  confirmMessage += 'Are you sure you want to submit?';
  if ( window.confirm( confirmMessage ) ) {
    try {
      const result = await axios.post( `${publicConfig.translationApiRoute}/submitTranslation`, translation );
      submitted = result.data;
      if ( submitted ) {
        const minutesUntilChanges = publicConfig.VALID_METADATA_DURATION / 1000 / 60;
        const submissionMessage = 'Translation submitted.'
                                  + ' Your translation should appear on the PhET website in about half an hour.'
                                  + ` It will take about ${minutesUntilChanges} minutes for the translation utility to`
                                  + ' show the changes you made.';
        window.alert( submissionMessage );
      }
      else {
        window.alert( 'An error occurred. Translation not submitted.' );
      }
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }

  return submitted;
};

export default submitTranslation;