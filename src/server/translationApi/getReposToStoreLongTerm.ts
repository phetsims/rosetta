// Copyright 2023, University of Colorado Boulder

/**
 * Export shared function, see function header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { isDeepStrictEqual } from 'node:util';
import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

type PreparedTranslation = {
  locale: string;
  multiRepoTranslationData: Record<string, Record<string, unknown>>;
};

/**
 * Given a translation that has been prepared for long-term storage, extract the repos that are in the translation, then for
 * each repo, get the old translation file and check to see if anything changed. If there was a change, add the repo to
 * the list of repos to put in long-term storage.
 *
 * @param preparedTranslation - contains the translation file contents for each repo in the translation
 * @returns A promise resolving to a list of repos to store in long-term storage
 */
const getReposToStoreLongTerm = async ( preparedTranslation: PreparedTranslation ): Promise<string[]> => {
  const reposToStoreLongTerm: string[] = [];
  const multiRepoTranslationData = preparedTranslation.multiRepoTranslationData;

  for ( const repo of Object.keys( multiRepoTranslationData ) ) {
    const oldTranslationFile = await longTermStorage.get( repo, preparedTranslation.locale );

    if ( Object.keys( oldTranslationFile ).length < Object.keys( multiRepoTranslationData[ repo ] ).length ) {

      // If the old translation file has strictly fewer string keys, then there's no way the translation file
      // multiRepoTranslationData are the same.
      reposToStoreLongTerm.push( repo );
    }
    else if ( Object.keys( oldTranslationFile ).length > Object.keys( multiRepoTranslationData[ repo ] ).length ) {

      // Handle cases where the old translation file has more string keys than the new one.
      logger.warn( `old translation file for ${repo} has more string keys than newly created translation file contents` );
      reposToStoreLongTerm.push( repo );
    }
    else if ( Object.keys( oldTranslationFile ).length === Object.keys( multiRepoTranslationData[ repo ] ).length ) {

      // Check if the contents differ when the number of keys is the same.
      let contentsDiffer = false;
      for ( const key of Object.keys( oldTranslationFile ) ) {
        if ( !isDeepStrictEqual( oldTranslationFile[ key ], multiRepoTranslationData[ repo ][ key ] ) ) {
          contentsDiffer = true;
          break;
        }
      }
      if ( contentsDiffer ) {
        reposToStoreLongTerm.push( repo );
      }
    }
  }

  return reposToStoreLongTerm;
};

export default getReposToStoreLongTerm;