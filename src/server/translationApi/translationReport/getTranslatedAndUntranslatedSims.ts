// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns an object containing the translated and untranslated sims for a given locale.
 *
 * @param locale - ISO 639-1 locale code, e.g. es for Spanish
 * @param isTeamMember - whether a translator is a team member
 * @returns A promise resolving to an object with lists of translated and untranslated sims
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import { SIMS_FOR_SHORT_REPORT } from '../../../common/constants.js';
import privateConfig from '../../../common/privateConfig.js';
import publicConfig from '../../../common/publicConfig.js';
import getTranslationInfo from './getTranslationInfo.js';

type TranslationInfo = Record<string, Record<string, { hasTranslation: boolean }>>;

type TranslatedAndUntranslatedSims = {
  translated: string[];
  untranslated: string[];
};

const getTranslatedAndUntranslatedSims = async ( locale: string,
                                                 isTeamMember: boolean ): Promise<TranslatedAndUntranslatedSims> => {

  // Create the object that will be returned. It will be populated below.
  const translatedAndUntranslatedSims: TranslatedAndUntranslatedSims = {
    translated: [],
    untranslated: []
  };

  // Get an object that lists all sims and the translation status for every locale.
  const translationInfo: TranslationInfo = await getTranslationInfo( isTeamMember );

  // If the environment is configured for short reports, reduce the list of sims included here.
  if ( publicConfig.ENVIRONMENT === 'development' && privateConfig.SHORT_REPORT ) {
    Object.keys( translationInfo ).forEach( key => {
      if ( !SIMS_FOR_SHORT_REPORT.includes( key ) ) {
        delete translationInfo[ key ];
      }
    } );
  }

  for ( const sim in translationInfo ) {
    if ( translationInfo[ sim ][ locale ]?.hasTranslation ) {
      translatedAndUntranslatedSims.translated.push( sim );
    }
    else {
      translatedAndUntranslatedSims.untranslated.push( sim );
    }
  }

  return translatedAndUntranslatedSims;
};

export default getTranslatedAndUntranslatedSims;