// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets the PhET website user data object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import publicConfig from '../../common/publicConfig.js';

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
 *     "loggedIn": false,
 *     "userId": null
 *   }
 *
 * @returns {Promise<Object>}
 */
const getWebsiteUserData = async () => {
  const websiteUserDataRes = await axios.get(
    publicConfig.WEBSITE_USER_DATA_URL,
    { withCredentials: true } // Include cookies so website backend can look up the session.
  );

  // Make sure the user ID is a number. We do this because on some servers it's a string and on others it's a number,
  // see https://github.com/phetsims/rosetta/issues/373.
  console.log( `--> websiteUserDataRes.data.userId = ${websiteUserDataRes.data.userId}` );
  console.log( `--> typeof websiteUserDataRes.data.userId = ${typeof websiteUserDataRes.data.userId}` );
  const userId = Number( websiteUserDataRes.data.userId );
  console.log( `--> userId = ${userId}` );

  const websiteUserData = websiteUserDataRes.data;
  console.log( `--> websiteUserData = ${JSON.stringify( websiteUserData, null, 2 )}` );
  websiteUserData.userId = userId;
  return websiteUserData;
};

export default getWebsiteUserData;