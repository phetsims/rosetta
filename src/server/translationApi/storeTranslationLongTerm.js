// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import github from 'octonode';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

const githubInterface = github.client( privateConfig.GITHUB_PAT );
const longTermStorage = githubInterface.repo( 'phetsims/babel' );

/**
 * Save the translation to long-term storage.
 *
 * @param {Object} preparedTranslation - exact translation file contents for each repo in a translation
 * @returns {Promise.<boolean>} - whether the translation was stored
 */
const storeTranslationLongTerm = async preparedTranslation => {
  logger.info( 'attempting to store translation long term' );
  let longTermStorageRes = null;
  if ( privateConfig.PERFORM_STRING_COMMITS ) {

    logger.info( 'attempting to perform string commits' );

    const contents = preparedTranslation.translationFileContents;
    for ( const repo of Object.keys( contents ) ) {

      logger.info( `iterating over ${repo}` );

      // Check to see if the object is not empty (i.e. strings were translated in repo).
      if ( Object.keys( contents[ repo ] ).length !== 0 ) {

        logger.info( `storing translation of strings in ${repo} long-term` );

        // Make the translation file contents a string and use base 64 encoding.
        const fileContents = JSON.stringify( contents[ repo ], null, 2 );
        const translationFilePath = `${repo}/${repo}-strings_${preparedTranslation.locale}.json`;
        const commitMessage = `automated commit from rosetta for sim/lib ${repo}, locale ${preparedTranslation.locale}`;
        try {

          logger.info( 'trying to update contents of file on github' );

          // Try to update the file.
          const contentsRes = await longTermStorage.contentsAsync( translationFilePath, privateConfig.BABEL_BRANCH );
          longTermStorageRes = await longTermStorage.updateContentsAsync(
            translationFilePath,
            commitMessage,
            fileContents,
            contentsRes[ 0 ].sha,
            privateConfig.BABEL_BRANCH
          );

          logger.info( 'updated contents of file on github' );
          logger.info( `stored translation of strings in ${repo} long-term` );
        }
        catch( e ) {
          if ( e.statusCode === 404 ) {

            logger.info( `file not found for ${preparedTranslation.locale}/${preparedTranslation.simName}` );

            try {

              // Try to create the file.
              logger.info( 'trying to create file on github' );
              longTermStorageRes = await longTermStorage.createContentsAsync(
                translationFilePath,
                commitMessage,
                fileContents,
                privateConfig.BABEL_BRANCH
              );
              console.log( `----------> longTermStorageRes = ${JSON.stringify( longTermStorageRes, null, 4 )}` );
              logger.info( 'created file on github' );
              logger.info( `stored translation of strings in ${repo} long-term` );
            }
            catch( e ) {
              logger.error( 'unable to create file' );
              logger.error( e );
            }
          }
          else {
            logger.error( e );
          }
        }
      }
    }
  }
  logger.info( `storage response not null: ${longTermStorageRes !== null}` );
  logger.info( 'done attempting to store translation long term' );
  return longTermStorageRes;
};

export default storeTranslationLongTerm;