// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting sim names and titles from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { SimNamesAndTitles } from '../ClientDataTypes';
import { WebsiteUserDataContext } from '../components/Rosetta';
import alertErrorMessage from '../js/alertErrorMessage';

/**
 * Get sims names and titles from the backend and return them. Show an error message if the request fails.
 */
const useSimNamesAndTitles = (): SimNamesAndTitles => {

  const websiteUserData = useContext( WebsiteUserDataContext );

  const [ simNamesAndTitles, setSimNamesAndTitles ] = useState<SimNamesAndTitles>( {} as SimNamesAndTitles );

  useEffect( () => {
    const fetchSimNamesAndTitles = async (): Promise<void> => {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/simNamesAndTitles?isTeamMember=${websiteUserData.teamMember}` );
        if ( !response.ok ) {
          throw new Error( `HTTP error! Status: ${response.status}` );
        }
        const data = await response.json();
        setSimNamesAndTitles( data );
      }
      catch( e ) {
        void alertErrorMessage( e as string );
      }
    };

    void fetchSimNamesAndTitles();
  }, [ websiteUserData ] );

  return simNamesAndTitles;
};

export default useSimNamesAndTitles;