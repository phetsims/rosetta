// Copyright 2022, University of Colorado Boulder

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';

const getReplacementStringObject = ( simHtml, translation ) => {
  logger.info( 'getting replacement string object' );

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
        stringKeysWithRepoName[ stringKeyWithRepoName ] = simSpecificObject[ stringKey ].translated;
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