// Copyright 2022, University of Colorado Boulder

import getLocaleInfo from './getLocaleInfo.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';

const getReplacementStringObject = async ( simHtml, translation ) => {
  logger.info( 'getting replacement string object' );

  const localeInfo = await getLocaleInfo();
  const direction = localeInfo[ translation.locale ].direction;

  // This will require refactoring in other locations.
  const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
  for ( const stringKeyWithRepoName of Object.keys( stringKeysWithRepoName ) ) {
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    if ( repoName === translation.simName ) {

      // We have a sim-specific repo.

      // Add translated key if it has been translated.
      const simSpecificObject = translation.translationFormData.simSpecific;
      const keyIsPresent = Object.keys( simSpecificObject ).includes( stringKey );
      if ( keyIsPresent ) {

        // To understand why we're adding embedding marks, see https://github.com/phetsims/rosetta/issues/27.
        const ltrMark = '\u202a';
        const rtlMark = '\u202b';
        const endDirectionalMark = '\u202c';
        const translatedValue = simSpecificObject[ stringKey ].translated;
        stringKeysWithRepoName[ stringKeyWithRepoName ] = direction === 'rtl' ?
                                                          rtlMark + translatedValue + endDirectionalMark :
                                                          ltrMark + translatedValue + endDirectionalMark;
      }
    }
    else {

      // We have a common repo.

      // Add translated key if it has been translated.
      const commonObject = translation.translationFormData.common;
      const keyIsPresent = Object.keys( commonObject ).includes( stringKey );
      if ( keyIsPresent ) {
        stringKeysWithRepoName[ stringKeyWithRepoName ] = commonObject[ stringKey ].translated;
      }
    }
  }
  logger.info( 'got replacement string object; returning it' );
  return stringKeysWithRepoName;
};

export default getReplacementStringObject;