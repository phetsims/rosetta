// Copyright 2022, University of Colorado Boulder

import getTranslationInfo from './getTranslationInfo.js';

/**
 * Export a function that returns an object containing the translated and untranslated sims for a given locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Return an object containing a list of translated sims and untranslated sims for a given locale.
 *
 * @param locale - ISO 639-1 locale code, e.g. es for Spanish
 * @returns {Promise<{translated: String[], untranslated: String[]}>}
 */
const getTranslatedAndUntranslatedSims = async locale => {
  const translatedAndUntranslatedSims = {
    translated: [],
    untranslated: []
  };
  const translationInfo = await getTranslationInfo();
  for ( const sim in translationInfo ) {
    console.log( sim );
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