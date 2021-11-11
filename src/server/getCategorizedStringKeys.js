// Copyright 2021, University of Colorado Boulder

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimHtml from './getSimHtml.js';
import getSimNames from './getSimNames.js';
import getSimUrl from './getSimUrl.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';

const getCategorizedStringKeys = async simName => {
  const categorizedStringKeys = {
    common: [],
    simSpecific: []
  };
  try {
    const simUrl = getSimUrl( simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const simNames = await getSimNames();
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
    logger.info( 'returning categorized string keys' );
  }
  catch( e ) {
    logger.error( e );
  }
  return categorizedStringKeys;
};

export { getCategorizedStringKeys as default };