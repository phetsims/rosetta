// Copyright 2021, University of Colorado Boulder

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimHtml from './getSimHtml.js';
import getSimNames from './getSimNames.js';
import getSimUrl from './getSimUrl.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';

const getCommonRepos = async simName => {
  const commonRepos = new Set();
  try {
    const simUrl = getSimUrl( simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const simNames = await getSimNames();
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
  logger.info( `returning ${simName}'s common repos sorted alphabetically` );
  return Array.from( commonRepos ).sort();
};

export { getCommonRepos as default };