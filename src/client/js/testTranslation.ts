// Copyright 2022, University of Colorado Boulder

/**
 * Open the sim in a new window with the strings the user has inputted.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { TranslationFormValues } from '../ClientDataTypes.js';
import alertErrorMessage from './alertErrorMessage.js';
import logError from './logError.js';
import makeTranslationObject from './makeTranslationObject.js';

/**
 * Use the backend to replace the sim's strings with the user's inputted strings, then open a new tab with the sim with
 * the replaced strings.
 *
 * @param values - translation form values
 * @param simName - name of the sim
 * @param locale - locale code for the sim
 */
const testTranslation = async ( values: TranslationFormValues, simName: string, locale: string ): Promise<void> => {
  const translation = await makeTranslationObject( values, simName, locale );
  try {
    const response = await fetch( `${TRANSLATION_API_ROUTE}/testTranslation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( translation )
    } );

    if ( !response.ok ) {
      await logError( `Failed to test translation: ${response.status} ${response.statusText}` );
    }

    const stringSimHtml = await response.text();

    // Open the translated sim in a new tab.
    const win = window.open( '' );
    if ( win ) {
      win.document.write( stringSimHtml );
    }
    else {
      await logError( 'Unable to open new window' );
    }
  }
  catch( e ) {
    await alertErrorMessage( 'In order for the test button to work, you need to enable pop-ups for this website. ' + e );
  }
};

export default testTranslation;