// Copyright 2022, University of Colorado Boulder

/**
 * Create the translation object we send to the server when the user submits their translation for publication to the
 * PhET website.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { TranslationFormValues } from '../clientTypes.js';
import getWebsiteUserData from './getWebsiteUserData';

export type TranslationObject = {
  userId: number | string; // some servers use a string for userId
  timestamp: number;
  simName: string;
  locale: string;
  translationFormData: TranslationFormValues;
};

/**
 * Return an object with the data needed for submitting the sim for publication, saving it for later, or testing it.
 */
const makeTranslationObject = async ( values: TranslationFormValues, simName: string, locale: string ): Promise<TranslationObject> => {
  const websiteUserData = await getWebsiteUserData();

  // Check for a user ID and if it's missing, replace it with a value from session storage.  This is part of a
  // workaround for an issue where null user IDs were being used when sessions expired, see
  // https://github.com/phetsims/rosetta/issues/412.
  // TODO: Remove this when better login checking exists, see https://github.com/phetsims/rosetta/issues/413.
  if ( typeof websiteUserData.userId !== 'number' ) {
    const storedUserId = window.sessionStorage.getItem( 'userId' );
    if ( storedUserId ) {
      console.warn( `Replacing null user ID with stored value ${storedUserId}.` );
      websiteUserData.userId = Number( storedUserId );
    }
    else {
      console.warn( 'Null user ID found and no stored value available.' );
    }
  }

  return {
    userId: websiteUserData.userId,
    timestamp: Date.now(),
    simName: simName,
    locale: locale,
    translationFormData: values
  };
};

export default makeTranslationObject;