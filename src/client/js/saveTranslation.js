// Copyright 2022, University of Colorado Boulder

/**
 * Save a translation to short-term string storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import publicConfig from '../../common/publicConfig.js';
import makeTranslationObject from './makeTranslationObject.js';

/**
 * Issue a post request to save a translation to the short-term string storage database.
 *
 * @param {Object} values - the values in the translation form
 * @param {String} simName - the name of the sim
 * @param {String} locale - the locale code
 */
const saveTranslation = async ( values, simName, locale ) => {
  const translation = await makeTranslationObject( values, simName, locale );
  if ( window.confirm( `If you have a translation saved for ${translation.simName} in locale ${translation.locale}, it will be overwritten.` ) ) {
    try {
      await axios.post( `${publicConfig.translationApiRoute}/saveTranslation`, translation );
      alert( 'Translation saved.' );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }
};

export default saveTranslation;