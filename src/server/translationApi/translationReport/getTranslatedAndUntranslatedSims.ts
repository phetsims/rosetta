// Copyright 2022, University of Colorado Boulder

import { SIMS_FOR_SHORT_REPORT } from '../../../common/constants.js';
import privateConfig from '../../../common/privateConfig.js';
import publicConfig from '../../../common/publicConfig.js';
import getTranslationInfo from './getTranslationInfo.js';

/**
 * Export a function that returns an object containing the translated and untranslated sims for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Return an object containing a list of translated and untranslated sims for a given locale.
 *
 * @param {String} locale - ISO 639-1 locale code, e.g. es for Spanish
 * @param {Boolean} isTeamMember - whether a translator is a team member
 * @returns {Promise<{translated: String[], untranslated: String[]}>} - lists of sims in kebab case, e.g. make-a-ten
 */
const getTranslatedAndUntranslatedSims = async ( locale, isTeamMember ) => {

  // Create the object that will be returned.  It will be populated below.
  const translatedAndUntranslatedSims = {
    translated: [],
    untranslated: []
  };

  // Get an object that lists all sims and the translation status for every locale.
  const translationInfo = await getTranslationInfo( isTeamMember );

  // If the environment is configured for short reports, which is useful for test & debug, reduce the list of sims that
  // are included here.
  if ( publicConfig.ENVIRONMENT === 'development' && privateConfig.SHORT_REPORT ) {
    Object.keys( translationInfo ).forEach( key => {
      if ( !SIMS_FOR_SHORT_REPORT.includes( key ) ) {
        delete translationInfo[ key ];
      }
    } );
  }

  for ( const sim in translationInfo ) {
    if ( translationInfo[ sim ][ locale ].hasTranslation ) {
      translatedAndUntranslatedSims.translated.push( sim );
    }
    else {
      translatedAndUntranslatedSims.untranslated.push( sim );
    }
  }
  return translatedAndUntranslatedSims;
};

export default getTranslatedAndUntranslatedSims;