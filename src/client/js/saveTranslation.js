// Copyright 2022, University of Colorado Boulder

/**
 * Save a translation to short-term string storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import makeTranslationObject from './makeTranslationObject.js';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';

/**
 * Issue a post request to save a translation to the short-term string storage database.
 *
 * @param {Object} values - the values in the translation form
 * @param {String} simName - the name of the sim
 * @param {String} locale - the locale code
 */
const saveTranslation = async ( values, simName, locale ) => {
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
    alertErrorMessage( e );
  }
};

export default saveTranslation;