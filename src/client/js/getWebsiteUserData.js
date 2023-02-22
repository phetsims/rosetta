// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets the PhET website user data object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import publicConfig from '../../common/publicConfig.js';

/**
 * Return the website user data object.
 *
 * We get the client config from the server because we need an easy way to tell
 * whether we're in production or development. We need this info because the
 * website's check-login service URL is undergoing some flux as of December 2022, and
 * we need to be able to set it dynamically based on where Rosetta is deployed.
 *
 * @returns {Promise<Object>}
 */
const getWebsiteUserData = async () => {
  const websiteUserDataRes = await axios.get(
    publicConfig.WEBSITE_USER_DATA_URL,
    { withCredentials: true } // Include cookies so website backend can look up your session.
  );

  // Convert user ID to number. We do this because on some servers it's a string
  // and on others it's a number. See https://github.com/phetsims/rosetta/issues/373.
  const userId = Number( websiteUserDataRes.data.userId );
  const websiteUserData = websiteUserDataRes.data;
  websiteUserData.userId = userId;
  return websiteUserData;
};

export default getWebsiteUserData;