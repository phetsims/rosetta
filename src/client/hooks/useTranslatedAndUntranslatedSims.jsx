// Copyright 2022, University of Colorado Boulder

/**
 * Get object containing a list of translated sims and a list of untranslated sims for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { WebsiteUserDataContext } from '../components/Rosetta.jsx';
import alertErrorMessage from '../js/alertErrorMessage.js';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';

/**
 * Return an object containing a list of translated sims and a list of untranslated sims for the given locale.
 *
 * @param locale
 * @returns {Object}
 */
const useTranslatedAndUntranslatedSims = locale => {
  const websiteUserData = useContext( WebsiteUserDataContext );
  const [ translatedAndUntranslatedSims, setTranslatedAndUntranslatedSims ] = useState( null );
  useEffect( async () => {
    try {
      const translatedAndUntranslatedSimsRes =
        await axios.get( `${TRANSLATION_API_ROUTE}/translatedAndUntranslatedSims/${locale}?isTeamMember=${websiteUserData.teamMember}` );
      setTranslatedAndUntranslatedSims( translatedAndUntranslatedSimsRes.data );
    }
    catch( e ) {
      alertErrorMessage( e );
    }
  }, [ websiteUserData ] );
  return translatedAndUntranslatedSims;
};

export default useTranslatedAndUntranslatedSims;