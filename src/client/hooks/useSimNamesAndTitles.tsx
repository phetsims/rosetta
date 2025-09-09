// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting sim names and titles from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { SimNamesAndTitles } from '../ClientDataTypes.js';
import { LoginStateContext } from '../components/Rosetta.jsx';
import alertErrorMessage from '../js/alertErrorMessage.js';

/**
 * Get sims names and titles from the backend and return them. Show an error message if the request fails.
 */
const useSimNamesAndTitles = (): SimNamesAndTitles => {

  const loginState = useContext( LoginStateContext );

  const [ simNamesAndTitles, setSimNamesAndTitles ] = useState<SimNamesAndTitles>( {} as SimNamesAndTitles );

  useEffect( () => {
    ( async (): Promise<void> => {
      try {
        const response = await fetch( `${TRANSLATION_API_ROUTE}/simNamesAndTitles?isTeamMember=${loginState.isTeamMember}` );
        if ( !response.ok ) {
          throw new Error( `HTTP error! Status: ${response.status}` );
        }
        const data = await response.json();
        setSimNamesAndTitles( data );
      }
      catch( e ) {
        await alertErrorMessage( e as string );
      }
    } )();

  }, [ loginState ] );

  return simNamesAndTitles;
};

export default useSimNamesAndTitles;