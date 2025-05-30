// Copyright 2022, University of Colorado Boulder

/**
 * Save a translation to short-term string storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { TranslationFormValues } from '../clientTypes.js';
import alertErrorMessage from './alertErrorMessage.js';
import makeTranslationObject from './makeTranslationObject.js';

/**
 * Issue a post request to save a translation to the short-term string storage database.
 */
const saveTranslation = async ( values: TranslationFormValues, simName: string, locale: string ): Promise<void> => {
  const translation = await makeTranslationObject( values, simName, locale );
  try {
    const response = await fetch( `${TRANSLATION_API_ROUTE}/saveTranslation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( translation )
    } );

    if ( !response.ok ) {
      throw new Error( `HTTP error! Status: ${response.status}` );
    }

    const data = await response.json();
    if ( data ) {
      window.alert( 'Translation saved.' );
    }
    else {
      window.alert( 'There was an issue with the short-term storage database. Translation not saved.' );
    }
  }
  catch( e ) {
    await alertErrorMessage( e instanceof Error ? e.message : String( e ) );
  }
};

export default saveTranslation;