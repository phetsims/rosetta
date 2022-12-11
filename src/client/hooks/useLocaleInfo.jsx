// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom react hook for getting locale info from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useEffect, useState } from 'react';
import alertErrorMessage from '../js/alertErrorMessage.js';
import clientConstants from '../js/clientConstants.js';

/**
 * Get the locale info from the backend and return it. If the request fails, show an error message.
 *
 * @returns {Object} - locale info with locale codes and locale names
 */
const useLocaleInfo = () => {
  const [ localeInfo, setLocaleInfo ] = useState( {} );
  useEffect( async () => {
    try {
      const localeInfoRes = await axios.get( `${clientConstants.translationApiRoute}/localeInfo` );
      setLocaleInfo( localeInfoRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return localeInfo;
};

export default useLocaleInfo;