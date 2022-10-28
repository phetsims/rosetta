// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useEffect, useState } from 'react';
import alertErrorMessage from '../utils/alertErrorMessage.js';

const useLocaleInfo = () => {
  const [ localeInfo, setLocaleInfo ] = useState( {} );

  // get locale info
  useEffect( async () => {
    try {
      const localeInfoRes = await axios.get( '/translationApi/localeInfo' );
      setLocaleInfo( localeInfoRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return localeInfo;
};

export default useLocaleInfo;