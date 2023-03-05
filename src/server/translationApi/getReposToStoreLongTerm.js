// Copyright 2023, University of Colorado Boulder

/**
 * Get a list of repos that need to have their translation file
 * contents put in long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { isDeepStrictEqual } from 'node:util';
import getTranslatedStringFile from './getTranslatedStringFile.js';
import logger from './logger.js';

/**
 * Given a translation that has been prepared for long-term storage,
 * extract the repos that in the translation, then for each repo, get
 * the old translation file and check to see if anything changed. If
 * there was a change, add the repo to the list of repos to put in
 * long-term storage.
 *
 * @param {Object} preparedTranslation - contains the translation file contents for each repo in the translation
 */
const getReposToStoreLongTerm = async preparedTranslation => {
  const reposToStoreLongTerm = [];
  const contents = preparedTranslation.translationFileContents;
  for ( const repo of Object.keys( contents ) ) {

    // Get old translation file if one exists. This should be a falsey value
    // if the translation file doesn't exist.
    const oldTranslationFile = await getTranslatedStringFile( repo, preparedTranslation.locale );

    if ( Object.keys( oldTranslationFile ).length < Object.keys( contents[ repo ] ).length ) {

      // If the old translation file has strictly less string keys, then there's no way
      // the translation file contents are the same.
      reposToStoreLongTerm.push( repo );
    }
    else if ( Object.keys( oldTranslationFile ).length > Object.keys( contents[ repo ] ).length ) {

      // There should never be a scenario where the old translation file has more string keys than
      // the newly created translation file contents.
      logger.error( `old translation file for ${repo} has more string keys than newly created translation file contents` );
    }
    else if ( Object.keys( oldTranslationFile ).length === Object.keys( contents[ repo ] ).length ) {

      // If the keys are the same length, then we need to check to see if the newly created
      // translation file contents matches the old translation file contents. If so, we
      // don't want to store the matching version in long-term storage.
      let contentsDiffer = false;
      for ( const key of Object.keys( oldTranslationFile ) ) {
        if ( !isDeepStrictEqual( oldTranslationFile[ key ], contents[ repo ][ key ] ) ) {
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