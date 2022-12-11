// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import { useEffect, useState } from 'react';
import alertErrorMessage from '../js/alertErrorMessage.js';
import clientConstants from '../js/clientConstants.js';

const useTranslatedAndUntranslatedSims = locale => {
  const [ translatedAndUntranslatedSims, setTranslatedAndUntranslatedSims ] = useState( null );
  useEffect( async () => {
    try {
      const translatedAndUntranslatedSimsRes =
        await axios.get( `${clientConstants.translationApiRoute}/translatedAndUntranslatedSims/${locale}` );
      setTranslatedAndUntranslatedSims( translatedAndUntranslatedSimsRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [] );
  return translatedAndUntranslatedSims;
};

export default useTranslatedAndUntranslatedSims;