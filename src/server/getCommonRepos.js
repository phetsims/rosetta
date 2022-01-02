// Copyright 2021, University of Colorado Boulder

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import logger from './logger.js';

const getCommonRepos = async ( simName, simNames, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s common repos` );
  const commonRepos = new Set();
  try {
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
      if ( ( simNames ).includes( repoName ) ) {
        logger.verbose( `${repoName} is in sim names; it's not a common repo` );
      }
      else {
        commonRepos.add( repoName );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s common repos; returning them sorted alphabetically` );
  return Array.from( commonRepos ).sort();
};

export { getCommonRepos as default };