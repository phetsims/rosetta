// Copyright 2022, University of Colorado Boulder

/**
 * Open the sim in a new window with the strings the user has inputted.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import alertErrorMessage from './alertErrorMessage.js';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import makeTranslationObject from './makeTranslationObject.js';

/**
 * Use the backend to replace the sim's strings with the user's inputted strings, then open a new tab with the sim with
 * the replaced strings.
 *
 * @param {Object} values - translation form values
 * @param {String} simName - name of the sim
 * @param {String} locale - locale code for the sim
 */
const testTranslation = async ( values, simName, locale ) => {
  const translation = await makeTranslationObject( values, simName, locale );
  try {
    const testRes = await axios.post( `${TRANSLATION_API_ROUTE}/testTranslation`, translation );
    const stringSimHtml = testRes.data;

    // Open the translated sim in a new tab.
    const win = window.open( '' );
    win.document.write( stringSimHtml );
  }
  catch( e ) {
    alertErrorMessage( 'In order for the test button to work, you need to enable pop-ups for this website. ' + e );
  }
};

export default testTranslation;