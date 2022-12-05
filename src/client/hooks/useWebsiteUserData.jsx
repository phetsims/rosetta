// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useState, useEffect } from 'react';

const useWebsiteUserData = () => {

  const [ websiteUserData, setWebsiteUserData ] = useState( {} );

  // get website user data
  useEffect( async () => {
    try {
      const clientConfigRes = await axios.get( '/translate/api/clientConfig' );
      const clientConfig = clientConfigRes.data;
      const websiteUserDataRes = await axios.get(
        clientConfig.websiteUserDataUrl,
        { withCredentials: true } // Include cookies so website backend can look up your session.
      );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );
  return websiteUserData;
};

export default useWebsiteUserData;