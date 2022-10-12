// Copyright 2022, University of Colorado Boulder

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';

const getReplacementStringObject = ( simHtml, translation ) => {
  logger.info( 'getting replacement string object' );
  const replacementStringObject = {};
  const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
  for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    if ( repoName === translation.simName ) {

      // We have a sim-specific repo.

      // Add translated key if it has been translated.
      const simSpecificObject = translation.simSpecific;
      const keyIsPresentAndTranslated = Object.keys( simSpecificObject ).includes( stringKey ) &&
                                        simSpecificObject[ stringKey ].translated !== '';
      if ( keyIsPresentAndTranslated ) {
        replacementStringObject[ stringKeyWithRepoName ] = simSpecificObject[ stringKey ].translated;
      }
    }
    else {

      // We have a common repo.

      // Add translated key if it has been translated.
      const commonObject = translation.common;
      const keyIsPresentAndTranslated = Object.keys( commonObject ).includes( stringKey ) &&
                                        commonObject[ stringKey ].translated !== '';
      if ( keyIsPresentAndTranslated ) {
        replacementStringObject[ stringKeyWithRepoName ] = commonObject[ stringKey ].translated;
      }
    }
  }
  logger.info( 'got replacement string object; returning it' );
  return replacementStringObject;
};

export default getReplacementStringObject;