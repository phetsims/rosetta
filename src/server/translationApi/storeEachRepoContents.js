// Copyright 2023, University of Colorado Boulder

/**
 * For a given prepared translation, store each repo's contents in long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

const storeEachRepoContents = async ( preparedTranslation, repos ) => {
  logger.info( `attempting to store repo contents for ${preparedTranslation.locale}/${preparedTranslation.simName} long-term` );
  let allRepoContentsStored = true;
  for ( const repo of repos ) {
    const repoContents = preparedTranslation.translationFileContents[ repo ];
    const wasStored = await longTermStorage.store( repo, preparedTranslation.locale, repoContents );

    // It's possible the repo contents are empty, in which case they shouldn't be stored.
    const shouldHaveBeenStored = Object.keys( repoContents ).length > 0;
    if ( !wasStored && shouldHaveBeenStored ) {
      allRepoContentsStored = false;
    }
  }
  logger.info( `all repo contents were stored: ${allRepoContentsStored}` );
  logger.info( `done attempting to store repo contents for ${preparedTranslation.locale}/${preparedTranslation.simName} long-term` );
  return allRepoContentsStored;
};

export default storeEachRepoContents;