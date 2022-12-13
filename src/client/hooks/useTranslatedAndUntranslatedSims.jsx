// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useEffect, useState } from 'react';
import alertErrorMessage from '../js/alertErrorMessage.js';
import publicConfig from '../../common/publicConfig.js';

const useTranslatedAndUntranslatedSims = locale => {
  const [ translatedAndUntranslatedSims, setTranslatedAndUntranslatedSims ] = useState( null );
  useEffect( async () => {
    try {
      const translatedAndUntranslatedSimsRes =
        await axios.get( `${publicConfig.translationApiRoute}/translatedAndUntranslatedSims/${locale}` );
      setTranslatedAndUntranslatedSims( translatedAndUntranslatedSimsRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return translatedAndUntranslatedSims;
};

export default useTranslatedAndUntranslatedSims;