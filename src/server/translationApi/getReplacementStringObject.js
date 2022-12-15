// Copyright 2022, University of Colorado Boulder

/**
 * Create a replacement string object to replace the original string object in a sim's HTML. Used for testing out
 * translations. When the user clicks the test button, the string object in the sim's HTML is replaced with the
 * one obtained from this function.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getLocaleInfo from './getLocaleInfo.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import logger from './logger.js';

/**
 * Return the replacement string object for a given sim and in-progress translation.
 *
 * @param stringKeysWithRepoName - object of REPO_NAME/stringKey: value
 * @param translation - the translation the user is working on
 * @returns {Promise<Object>} - the replacement string object
 */
const getReplacementStringObject = async ( stringKeysWithRepoName, translation ) => {
  logger.info( 'getting replacement string object' );

  const localeInfo = await getLocaleInfo();
  const direction = localeInfo[ translation.locale ].direction;

  for ( const stringKeyWithRepoName of Object.keys( stringKeysWithRepoName ) ) {
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );
    if ( repoName === translation.simName ) {

      // We have a sim-specific repo.

      // Add translated key if it has been translated.
      const simSpecificObject = translation.translationFormData.simSpecific;
      const keyIsPresent = Object.keys( simSpecificObject ).includes( stringKeyWithoutDots );
      const keyIsTranslated = keyIsPresent ? simSpecificObject[ stringKeyWithoutDots ].translated !== '' : false;
      if ( keyIsTranslated ) {

        // To understand why we're adding embedding marks, see https://github.com/phetsims/rosetta/issues/27.
        const ltrMark = '\u202a';
        const rtlMark = '\u202b';
        const endDirectionalMark = '\u202c';
        const translatedValue = simSpecificObject[ stringKeyWithoutDots ].translated;
        stringKeysWithRepoName[ stringKeyWithRepoName ] = direction === 'rtl' ?
                                                          rtlMark + translatedValue + endDirectionalMark :
                                                          ltrMark + translatedValue + endDirectionalMark;
      }
    }
    else {

      // We have a common repo.

      // Add translated key if it has been translated.
      const commonObject = translation.translationFormData.common;
      const keyIsPresent = Object.keys( commonObject ).includes( stringKeyWithoutDots );
      const keyIsTranslated = keyIsPresent ? commonObject[ stringKeyWithoutDots ].translated !== '' : false;
      if ( keyIsTranslated ) {

        // To understand why we're adding embedding marks, see https://github.com/phetsims/rosetta/issues/27.
        const ltrMark = '\u202a';
        const rtlMark = '\u202b';
        const endDirectionalMark = '\u202c';
        const translatedValue = commonObject[ stringKeyWithoutDots ].translated;
        stringKeysWithRepoName[ stringKeyWithRepoName ] = direction === 'rtl' ?
                                                          rtlMark + translatedValue + endDirectionalMark :
                                                          ltrMark + translatedValue + endDirectionalMark;
      }
    }
  }
  logger.info( 'got replacement string object; returning it' );
  return stringKeysWithRepoName;
};

export default getReplacementStringObject;