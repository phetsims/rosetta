// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting website user data.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useEffect, useState } from 'react';
import { WebsiteUserData } from '../clientTypes';
import alertErrorMessage from '../js/alertErrorMessage';
import getWebsiteUserData from '../js/getWebsiteUserData';

/**
 * Return the website user data we get from the PhET website.
 */
const useWebsiteUserData = (): WebsiteUserData => {
  const [ websiteUserData, setWebsiteUserData ] = useState<WebsiteUserData>( {} as WebsiteUserData );

  useEffect( () => {
    const fetchWebsiteUserData = async (): Promise<void> => {
      try {
        setWebsiteUserData( await getWebsiteUserData() );
      }
      catch( e ) {
        void alertErrorMessage( e as string );
      }
    };

    void fetchWebsiteUserData();
  }, [] );

  return websiteUserData;
};

export default useWebsiteUserData;