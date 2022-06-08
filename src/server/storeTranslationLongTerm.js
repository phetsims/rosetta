// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in long-term storage.
 *
 * @author Liam Mulhall
 */

import github from 'octonode';
import config from './config.js';
import logger from './logger.js';

const githubInterface = github.client( config.GITHUB_PAT );
const longTermStorage = githubInterface.repo( 'phetsims/babel' );

/**
 * Save the translation to long-term storage.
 *
 * @param {Object} preparedTranslation - exact translation file contents for each repo in a translation
 */
const storeTranslationLongTerm = async preparedTranslation => {
  if ( config.PERFORM_STRING_COMMITS === 'true' ) {

    const contents = preparedTranslation.translationFileContents;
    for ( const repo of Object.keys( contents ) ) {

      // check to see if the object is not empty (i.e. strings were translated in repo)
      if ( Object.keys( contents[ repo ] ).length !== 0 ) {

        logger.info( `storing translation of strings in ${repo} long-term` );

        // make the translation file contents a string and use base 64 encoding
        const fileContents = JSON.stringify( contents[ repo ], null, 2 );

        const translationFilePath = `${repo}/${repo}-strings_${preparedTranslation.locale}.json`;

        try {

          // try to update the file
          const contentsRes = await longTermStorage.contentsAsync( translationFilePath, config.BABEL_BRANCH );
          const commitMessage = `automated commit from rosetta for sim/lib ${repo}, locale ${preparedTranslation.locale}`;
          await longTermStorage.updateContentsAsync(
            translationFilePath,
            commitMessage,
            fileContents,
            contentsRes[ 0 ].sha,
            config.BABEL_BRANCH
          );
        }
        catch( e ) {
          try {

            // try to create the file
            console.log( 'TRY TO CREATE FILE' );
          }
          catch( e ) {
            logger.error( e );
          }
          logger.error( e );
        }
      }
    }

  }
};

export default storeTranslationLongTerm;