// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useState, useEffect } from 'react';

const useWebsiteUserData = () => {

  const [ websiteUserData, setWebsiteUserData ] = useState( {} );

  // get website user data
  useEffect( async () => {
    try {
      const websiteUserDataRes = await axios.get( `${window.location.origin}/services/check-login` );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );
  return websiteUserData;
};

export default useWebsiteUserData;