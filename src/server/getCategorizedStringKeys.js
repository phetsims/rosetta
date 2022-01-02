// Copyright 2021, University of Colorado Boulder

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import logger from './logger.js';

const getCategorizedStringKeys = async ( simName, simNames, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s categorized string keys` );
  const categorizedStringKeys = {
    common: [],
    simSpecific: []
  };
  try {
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
      const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
      if ( stringKey.includes( 'a11y' ) ) {
        logger.verbose( 'not categorizing a11y string key' );
      }
      else {
        if ( simNames.includes( repoName ) ) {
          logger.verbose( `categorizing sim-specific string key: ${stringKeyWithRepoName}` );
          categorizedStringKeys.simSpecific.push( stringKey );
        }
        else {
          logger.verbose( `categorizing common string key: ${stringKeyWithRepoName}` );
          categorizedStringKeys.common.push( stringKey );
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s categorized string keys; returning them` );
  return categorizedStringKeys;
};

export default getCategorizedStringKeys;