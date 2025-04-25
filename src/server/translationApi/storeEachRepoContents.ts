// Copyright 2023, University of Colorado Boulder

/**
 * For a given prepared translation, store the translation data for each repo in long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { StorableTranslationData } from './StorableTranslationData.js';
import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

const storeEachRepoContents = async ( preparedTranslation: StorableTranslationData,
                                      repos: string[] ): Promise<boolean> => {

  logger.info(
    `attempting to store new or updated translation data for ${preparedTranslation.locale}/${preparedTranslation.simName} in long-term storage`
  );

  let allTranslationDataStored = true;

  for ( const repo of repos ) {
    const translationData = preparedTranslation.multiRepoTranslationData[ repo ];
    const wasStored = await longTermStorage.store( repo, preparedTranslation.locale, translationData );

    // It's possible the repo contents are empty, in which case they shouldn't be stored.
    const shouldHaveBeenStored = Object.keys( translationData ).length > 0;
    if ( !wasStored && shouldHaveBeenStored ) {
      allTranslationDataStored = false;
    }
  }

  logger.info( `all translation data sets were stored: ${allTranslationDataStored}` );
  logger.info(
    `done attempting to store translation data sets for ${preparedTranslation.locale}/${preparedTranslation.simName} long term`
  );

  return allTranslationDataStored;
};

export default storeEachRepoContents;