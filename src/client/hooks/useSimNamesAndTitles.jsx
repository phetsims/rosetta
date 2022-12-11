// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom hook for getting sim names and titles from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useState, useEffect } from 'react';
import alertErrorMessage from '../js/alertErrorMessage.js';
import clientConstants from '../js/clientConstants.js';

/**
 * Get sims names and titles from the backend and return them. Show an error message if the request fails.
 *
 * @returns {Object} - an object with sim names as keys and sim titles as values
 */
const useSimNamesAndTitles = () => {

  const [ simNamesAndTitles, setSimNamesAndTitles ] = useState( [] );
  useEffect( async () => {
    try {
      const simTitlesRes = await axios.get( `${clientConstants.translationApiRoute}/simNamesAndTitles` );
      setSimNamesAndTitles( simTitlesRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return simNamesAndTitles;
};

export default useSimNamesAndTitles;