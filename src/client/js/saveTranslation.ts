// Copyright 2022, University of Colorado Boulder

/**
 * Save a translation to short-term string storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { TranslationFormValues } from '../clientTypes.js';
import alertErrorMessage from './alertErrorMessage';
import makeTranslationObject from './makeTranslationObject';

/**
 * Issue a post request to save a translation to the short-term string storage database.
 */
const saveTranslation = async ( values: TranslationFormValues, simName: string, locale: string ): Promise<void> => {
  const translation = await makeTranslationObject( values, simName, locale );
  try {
    const savedRes = await axios.post( `${TRANSLATION_API_ROUTE}/saveTranslation`, translation );
    if ( savedRes.data ) {
      window.alert( 'Translation saved.' );
    }
    else {
      window.alert( 'There was an issue with the short-term storage database. Translation not saved.' );
    }
  }
  catch( e ) {
    await alertErrorMessage( e as string );
  }
};

export default saveTranslation;