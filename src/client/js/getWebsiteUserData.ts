// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets the PhET website user data object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import clientConfig from '../../common/clientConfig';
import { WebsiteUserData } from '../ClientDataTypes';

/**
 * Get the user data object from website.
 *
 * As of June 2023, the object returned by the request to the server when the user is logged in looks like this:
 *
 *   websiteUserData = {
 *     "loggedIn": true,
 *     "username": "Bob",
 *     "email": "bob.somebody@somewhere.edu",
 *     "userId": 4321,
 *     "teamMember": true,
 *     "trustedTranslator": true,
 *     "translatorLocales": null,
 *     "subscribed": false
 *   }
 *
 * For a user that is NOT logged in, it looks like this:
 *
 *   websiteUserData = {
 *     "loggedIn": false
 *   }
 *
 */
const getWebsiteUserData = async (): Promise<WebsiteUserData> => {
  const response = await fetch( clientConfig.WEBSITE_USER_DATA_URL, {
      method: 'GET',
      credentials: 'include' // Include cookies so website backend can look up the session.
    }
  );

  if ( !response.ok ) {
    throw new Error( `Failed to fetch user data: ${response.status} ${response.statusText}` );
  }

  const websiteUserData: WebsiteUserData = await response.json();

  // Make sure the user ID is a number if it is present. We do this because on some servers it's a string and on others
  // it's a number, see https://github.com/phetsims/rosetta/issues/373.
  if ( typeof websiteUserData.userId === 'string' && !isNaN( Number( websiteUserData.userId ) ) ) {
    websiteUserData.userId = Number( websiteUserData.userId );
  }
  return websiteUserData;
};

export default getWebsiteUserData;