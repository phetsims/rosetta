// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting website user data.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useState, useEffect } from 'react';
import alertErrorMessage from '../js/alertErrorMessage.js';
import getWebsiteUserData from '../js/getWebsiteUserData.js';

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
      setWebsiteUserData( await getWebsiteUserData() );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return websiteUserData;
};

export default useWebsiteUserData;