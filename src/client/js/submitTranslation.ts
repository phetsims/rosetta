// Copyright 2022, University of Colorado Boulder

/**
 * Submit a translation for publication to the PhET website.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { TRANSLATION_API_ROUTE } from '../../common/constants';
import KeyTypesEnum from '../../common/KeyTypesEnum';
import publicConfig from '../../common/publicConfig';
import { TranslationFormData } from '../clientTypes.js';
import alertErrorMessage from './alertErrorMessage';
import computeTranslatedStringsData from './computeTranslatedStringsData';
import makeTranslationObject from './makeTranslationObject';

type SubmitStatus = {
  allRepoContentsStored: boolean;
  buildRequestsSucceeded: boolean;
};

type Message = { [key: string]: string };

/**
 * Issue a post request to submit a translation for publication to the PhET website.
 */
const submitTranslation = async (
  values: TranslationFormData,
  simName: string,
  locale: string,
  simTitle: string,
  localeName: string
): Promise<SubmitStatus | null> => {

  const translatedStringsData = computeTranslatedStringsData( values );
  const translation = await makeTranslationObject( values, simName, locale );
  const messages: Message = {};

  for ( const keyType of Object.values( KeyTypesEnum ) ) {
    if ( translatedStringsData[ keyType ]?.translated !== undefined ) {
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
      const response = await fetch( `${TRANSLATION_API_ROUTE}/submitTranslation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( translation )
      } );

      if ( !response.ok ) {
        throw new Error( `Failed to submit translation: ${response.status} ${response.statusText}` );
      }

      const submitStatus: SubmitStatus = await response.json();

      if ( submitStatus.allRepoContentsStored && submitStatus.buildRequestsSucceeded ) {
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
      else if ( !submitStatus.allRepoContentsStored && submitStatus.buildRequestsSucceeded ) {
        window.alert( 'Not all translation contents (possibly none) were stored in long-term storage, but the build request was sent to the build server.' );
      }
      else if ( submitStatus.allRepoContentsStored && !submitStatus.buildRequestsSucceeded ) {
        window.alert( 'Your translation was saved to the long-term storage database, but the build request was not sent to the build server.' );
      }
      else if ( !submitStatus.allRepoContentsStored && !submitStatus.buildRequestsSucceeded ) {
        window.alert( 'Your translation was not saved to the long-term storage database, and the build request was not sent to the build server.' );
      }
    }
    catch( e ) {
      await alertErrorMessage( e as string );
    }
  }

  return null;
};

export default submitTranslation;