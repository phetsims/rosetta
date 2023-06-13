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

    // Check for a null user ID and, if present, replace it with a value from session storage.  This is part of a
    // workaround for an issue where null user IDs were being used when sessions expired, see
    // https://github.com/phetsims/rosetta/issues/412.
    // TODO: Remove this when better login checking exists, see https://github.com/phetsims/rosetta/issues/413.
    if ( websiteUserData.userId === null ) {
      const storedUserId = window.sessionStorage.getItem( 'userId' );
      if ( storedUserId ) {
        console.warn( `Replacing null user ID with stored value ${storedUserId}.` );
        websiteUserData.userId = Number( storedUserId );
      }
      else {
        console.warn( 'Null user ID found and no stored value available.' );
      }
    }
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