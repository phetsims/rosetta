// Copyright 2022, University of Colorado Boulder

/**
 * Create the translation object we send to the server when the user submits their translation for publication to the
 * PhET website.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import alertErrorMessage from './alertErrorMessage.js';
import getWebsiteUserData from './getWebsiteUserData.js';

/**
 * Return an object with the data needed for submitting the sim for publication.
 *
 * @param {Object} values - values we get from the translation form
 * @param {String} simName - name of the sim being translated
 * @param {String} locale - locale code of the sim being translated
 * @returns {Promise<Object>} - object with data necessary for submission
 */
const makeTranslationObject = async ( values, simName, locale ) => {
  let translation;
  try {
    const websiteUserData = await getWebsiteUserData();
    translation = {
      userId: websiteUserData.userId,
      timestamp: Date.now(),
      simName: simName,
      locale: locale,
      translationFormData: values
    };
  }
  catch( e ) {
    alertErrorMessage( e );
    translation = { error: 'unable to make translation' };
  }
  return translation;
};

export default makeTranslationObject;