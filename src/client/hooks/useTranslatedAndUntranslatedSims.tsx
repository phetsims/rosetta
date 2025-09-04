// Copyright 2022, University of Colorado Boulder

/**
 * Get object containing a list of translated sims and a list of untranslated sims for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';
import { LoginStateContext } from '../components/Rosetta.jsx';
import alertErrorMessage from '../js/alertErrorMessage.js';

type TranslatedAndUntranslatedSims = {
  translated: string[];
  untranslated: string[];
} | null;

/**
 * Return an object containing a list of translated sims and a list of untranslated sims for the given locale.
 */
const useTranslatedAndUntranslatedSims = ( locale: string ): TranslatedAndUntranslatedSims => {
  const loginState = useContext( LoginStateContext );
  const [ translatedAndUntranslatedSims, setTranslatedAndUntranslatedSims ] = useState<TranslatedAndUntranslatedSims>( null );

  useEffect( () => {
    const fetchTranslatedAndUntranslatedSims = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${TRANSLATION_API_ROUTE}/translatedAndUntranslatedSims/${locale}?isTeamMember=${loginState.isTeamMember}`
        );
        if ( !response.ok ) {
          throw new Error( `HTTP error! Status: ${response.status}` );
        }
        const data = await response.json();
        setTranslatedAndUntranslatedSims( data );
      }
      catch( e ) {
        void alertErrorMessage( e as string );
      }
    };

    void fetchTranslatedAndUntranslatedSims();
  }, [ loginState, locale ] );

  return translatedAndUntranslatedSims;
};

export default useTranslatedAndUntranslatedSims;