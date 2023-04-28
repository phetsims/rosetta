// Copyright 2022, University of Colorado Boulder

/**
 * Create a custom react hook for getting locale info from the backend.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import alertErrorMessage from '../js/alertErrorMessage.js';

/**
 * Get the locale info from the backend and return it. If the request fails, show an error message.
 *
 * @returns {Object} - locale info with locale codes and locale names
 */
const useLocaleInfo = () => {
  const [ localeInfo, setLocaleInfo ] = useState( {} );
  useEffect( async () => {
    try {
      const localeInfoRes = await axios.get( `${TRANSLATION_API_ROUTE}/localeInfo` );
      setLocaleInfo( localeInfoRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return localeInfo;
};

export default useLocaleInfo;