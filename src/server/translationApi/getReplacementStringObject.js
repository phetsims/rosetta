// Copyright 2022, University of Colorado Boulder

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';

const getReplacementStringObject = ( simHtml, translation ) => {
  logger.info( 'getting replacement string object' );
  const replacementStringObject = {};

  // TODO: We should return the object from getStringKeysWithRepoName rather than Object.keys().
  // This will require refactoring in other locations.
  const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
  for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    if ( repoName === translation.simName ) {

      // We have a sim-specific repo.

      // Add translated key if it has been translated.
      const simSpecificObject = translation.translationFormData.simSpecific;
      const keyIsPresent = Object.keys( simSpecificObject ).includes( stringKey );
      if ( keyIsPresent ) {
        replacementStringObject[ stringKeyWithRepoName ] = simSpecificObject[ stringKey ].translated;
      }
    }
    else {

      // We have a common repo.

      // Add translated key if it has been translated.
      const commonObject = translation.translationFormData.common;
      const keyIsPresent = Object.keys( commonObject ).includes( stringKey );
      if ( keyIsPresent ) {
        replacementStringObject[ stringKeyWithRepoName ] = commonObject[ stringKey ].translated;
      }
    }
  }
  logger.info( 'got replacement string object; returning it' );
  return replacementStringObject;
};

export default getReplacementStringObject;