// Copyright 2022, University of Colorado Boulder

/**
 * Get object containing a list of translated sims and a list of untranslated sims for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useEffect, useState } from 'react';
import alertErrorMessage from '../js/alertErrorMessage.js';
import publicConfig from '../../common/publicConfig.js';

/**
 * Return an object containing a list of translated sims and a list of untranslated sims for the given locale.
 *
 * @param locale
 * @returns {Object}
 */
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