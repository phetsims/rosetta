// Copyright 2022, University of Colorado Boulder

/**
 * Submit a translation for publication to the PhET website.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import KeyTypesEnum from '../../common/KeyTypesEnum.js';
import publicConfig from '../../common/publicConfig.js';
import alertErrorMessage from './alertErrorMessage.js';
import computeTranslatedStringsData from './computeTranslatedStringsData.js';
import makeTranslationObject from './makeTranslationObject.js';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';

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

  let submitStatus = null;
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
      const result = await axios.post( `${TRANSLATION_API_ROUTE}/submitTranslation`, translation );
      submitStatus = result.data;
      if ( submitStatus.allRepoContentsStored && submitStatus.buildRequested ) {
        const units = 'hours';
        const timeUntilChanges = publicConfig.VALID_METADATA_DURATION / 1000 / 60 / 60;
        const submissionMessage = 'Translation submitted.'
                                  + ' Your translation should appear on the PhET website in about half an hour.'
                                  + ` It will take about ${timeUntilChanges} ${units} for the translation utility to`
                                  + ' show the changes you made.';
        window.alert( submissionMessage );

        // Reload the page to reset the form so that the buttons are disabled
        // and the form is no longer dirty.
        window.location.reload();
      }
      else if ( !submitStatus.allRepoContentsStored && submitStatus.buildRequested ) {
        window.alert( 'Not all translation contents (possibly none) were stored in long-term storage, but the build request was sent to the build server.' );
      }
      else if ( submitStatus.allRepoContentsStored && !submitStatus.buildRequested ) {
        window.alert( 'Your translation was saved to the long-term storage database, but the build request was not sent to the build server.' );
      }
      else if ( !submitStatus.allRepoContentsStored && !submitStatus.buildRequested ) {
        window.alert( 'Your translation was not saved to the long-term storage database, and the build request was not sent to the build server.' );
      }
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }

  return submitStatus;
};

export default submitTranslation;