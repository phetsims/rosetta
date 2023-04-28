// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting sim names and titles from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { WebsiteUserDataContext } from '../components/Rosetta.jsx';
import alertErrorMessage from '../js/alertErrorMessage.js';

/**
 * Get sims names and titles from the backend and return them. Show an error message if the request fails.
 *
 * @returns {Object} - an object with sim names as keys and sim titles as values
 */
const useSimNamesAndTitles = () => {

  const websiteUserData = useContext( WebsiteUserDataContext );

  const [ simNamesAndTitles, setSimNamesAndTitles ] = useState( [] );
  useEffect( async () => {
    try {
      const simTitlesRes = await axios.get( `${TRANSLATION_API_ROUTE}/simNamesAndTitles?isTeamMember=${websiteUserData.teamMember}` );
      setSimNamesAndTitles( simTitlesRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [ websiteUserData ] );
  return simNamesAndTitles;
};

export default useSimNamesAndTitles;