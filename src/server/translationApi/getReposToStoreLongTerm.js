// Copyright 2023, University of Colorado Boulder

/**
 * Get a list of repos that need to have their translation file
 * contents put in long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { isDeepStrictEqual } from 'node:util';
import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

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

    const oldTranslationFile = await longTermStorage.get( repo, preparedTranslation.locale );

    if ( Object.keys( oldTranslationFile ).length < Object.keys( contents[ repo ] ).length ) {

      // If the old translation file has strictly less string keys, then there's no way
      // the translation file contents are the same.
      reposToStoreLongTerm.push( repo );
    }
    else if ( Object.keys( oldTranslationFile ).length > Object.keys( contents[ repo ] ).length ) {

      // I (Liam Mulhall) think it's possible for an old translation file to have more string keys
      // than the set of string keys presented to the user. The way this could happen is a version of
      // a sim is published with a set of string keys S. A user fully translates the sim so that the
      // translation file has |S| string keys. Then the developer re-publishes the sim with S' string
      // keys where |S'| < |S|. Then the number of string keys in the old translation file will be greater
      // than the number of string keys presented to the user.
      logger.warn( `old translation file for ${repo} has more string keys than newly created translation file contents` );

      // If there are more string keys in the old translation file than are presented to the user, we
      // might need to update long-term storage. For instance, if a developer removed 3 strings
      // and then added 2 new ones, we'd need to update long-term storage.
      reposToStoreLongTerm.push( repo );
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