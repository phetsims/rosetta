// Copyright 2022, University of Colorado Boulder

/**
 * Get object containing a list of translated sims and a list of untranslated sims for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext, useEffect, useState } from 'react';
import { TRANSLATION_API_ROUTE } from '../../common/constants';
import { WebsiteUserDataContext } from '../components/Rosetta';
import alertErrorMessage from '../js/alertErrorMessage';

type TranslatedAndUntranslatedSims = {
  translated: string[];
  untranslated: string[];
} | null;

/**
 * Return an object containing a list of translated sims and a list of untranslated sims for the given locale.
 */
const useTranslatedAndUntranslatedSims = ( locale: string ): TranslatedAndUntranslatedSims => {
  const websiteUserData = useContext( WebsiteUserDataContext );
  const [ translatedAndUntranslatedSims, setTranslatedAndUntranslatedSims ] = useState<TranslatedAndUntranslatedSims>( null );

  useEffect( () => {
    const fetchTranslatedAndUntranslatedSims = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${TRANSLATION_API_ROUTE}/translatedAndUntranslatedSims/${locale}?isTeamMember=${websiteUserData.teamMember}`
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
  }, [ websiteUserData, locale ] );

  return translatedAndUntranslatedSims;
};

export default useTranslatedAndUntranslatedSims;