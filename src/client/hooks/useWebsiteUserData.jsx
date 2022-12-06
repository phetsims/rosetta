// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting website user data.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useState, useEffect } from 'react';
import alertErrorMessage from '../utils/alertErrorMessage.js';

/**
 * Return the website user data we get from the PhET website.
 *
 * @returns {Object} - website user data, including whether someone is logged in, a trusted translator, or a team
 *                     member.
 */
const useWebsiteUserData = () => {
  const [ websiteUserData, setWebsiteUserData ] = useState( {} );
  useEffect( async () => {
    try {

      // We get the client config from the server because we need an easy way to tell
      // whether we're in production or development. We need this info because the
      // website's check-login service URL is undergoing some flux, and we need to be
      // able to set it dynamically based on where Rosetta is deployed. For the website's
      // check-login service URLs, see the server module where we define the client config.
      const clientConfigRes = await axios.get( '/translate/api/clientConfig' );
      const clientConfig = clientConfigRes.data;
      const websiteUserDataRes = await axios.get(
        clientConfig.websiteUserDataUrl,
        { withCredentials: true } // Include cookies so website backend can look up your session.
      );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return websiteUserData;
};

export default useWebsiteUserData;