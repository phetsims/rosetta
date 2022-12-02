// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in long-term storage.
 *
 * @author Liam Mulhall
 */

import github from 'octonode';
import config from '../../common/config.js';
import logger from './logger.js';

const githubInterface = github.client( config.GITHUB_PAT );
const longTermStorage = githubInterface.repo( 'phetsims/babel' );

/**
 * Save the translation to long-term storage.
 *
 * @param {Object} preparedTranslation - exact translation file contents for each repo in a translation
 * @returns {Promise.<boolean>}
 */
const storeTranslationLongTerm = async preparedTranslation => {
  let longTermStorageRes = null;
  if ( config.PERFORM_STRING_COMMITS ) {

    const contents = preparedTranslation.translationFileContents;
    for ( const repo of Object.keys( contents ) ) {

      // check to see if the object is not empty (i.e. strings were translated in repo)
      if ( Object.keys( contents[ repo ] ).length !== 0 ) {

        logger.info( `storing translation of strings in ${repo} long-term` );

        // make the translation file contents a string and use base 64 encoding
        const fileContents = JSON.stringify( contents[ repo ], null, 2 );
        const translationFilePath = `${repo}/${repo}-strings_${preparedTranslation.locale}.json`;
        const commitMessage = `automated commit from rosetta for sim/lib ${repo}, locale ${preparedTranslation.locale}`;
        try {

          logger.info( 'trying to update contents of file on github' );

          const contentsRes = await longTermStorage.contentsAsync( translationFilePath, config.BABEL_BRANCH );
          longTermStorageRes = await longTermStorage.updateContentsAsync(
            translationFilePath,
            commitMessage,
            fileContents,
            contentsRes[ 0 ].sha,
            config.BABEL_BRANCH
          );

          logger.info( 'updated contents of file on github' );
          logger.info( `stored translation of strings in ${repo} long-term` );
        }
        catch( e ) {
          logger.error( e );
          try {

            // try to create the file
            logger.info( 'trying to create file on github' );
            longTermStorageRes = await longTermStorage.createContentsAsync(
              translationFilePath,
              commitMessage,
              fileContents,
              config.BABEL_BRANCH
            );
            logger.info( 'created file on github' );
            logger.info( `stored translation of strings in ${repo} long-term` );
          }
          catch( e ) {
            logger.error( e );
          }
        }
      }
    }
  }
  return longTermStorageRes;
};

export default storeTranslationLongTerm;