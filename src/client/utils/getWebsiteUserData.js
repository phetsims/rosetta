// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets the PhET website user data object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';

/**
 * Return the website user data object.
 *
 * We get the client config from the server because we need an easy way to tell
 * whether we're in production or development. We need this info because the
 * website's check-login service URL is undergoing some flux as of December 2022, and
 * we need to be able to set it dynamically based on where Rosetta is deployed. For
 * the website's check-login service URLs, see the server module where we define the
 * client config.
 *
 * @returns {Promise<Object>}
 */
const getWebsiteUserData = async () => {
  const clientConfigRes = await axios.get( '/translate/api/clientConfig' );
  const clientConfig = clientConfigRes.data;
  const websiteUserDataRes = await axios.get(
    clientConfig.websiteUserDataUrl,
    { withCredentials: true } // Include cookies so website backend can look up your session.
  );
  return websiteUserDataRes.data;
};

export default getWebsiteUserData;