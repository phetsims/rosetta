// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that transforms a translation into the format that expected for long-term storage string files.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getStringKeysWithDots from './getStringKeysWithDots.js';
import logger from './logger.js';
import makeTranslationFileContentsForRepo from './makeTranslationFileContentsForRepo.js';

/**
 * Return an object with the exact translation file contents for each repo in a given translation.
 *
 * @param {Object} translation - translation received from client
 * @returns {Object} - exact translation file contents for each repo in a translation
 */
const prepareTranslationForLongTermStorage = async translation => {

  logger.info( `preparing translation of ${translation.locale}/${translation.simName} for long-term storage` );
  logger.info( 'adding back dots to translation form data from client' );
  translation.translationFormData.simSpecific = getStringKeysWithDots( translation.translationFormData.simSpecific );
  translation.translationFormData.common = getStringKeysWithDots( translation.translationFormData.common );
  translation.translationFormData.shared = getStringKeysWithDots( translation.translationFormData.shared );

  // Get a list of repos whose strings are in the translation.
  const repos = [ translation.simName ];
  const commonData = translation.translationFormData.common;
  const sharedData = translation.translationFormData.shared;
  const dataObjects = [ commonData, sharedData ];
  for ( const dataObject of dataObjects ) {
    for ( const stringKey of Object.keys( dataObject ) ) {
      const repoName = dataObject[ stringKey ].repo;
      if ( !repos.includes( repoName ) ) {
        repos.push( repoName );
      }
    }
  }

  // For each repo in the translation, make its translation file contents.
  const preparedTranslation = {
    simName: translation.simName,
    locale: translation.locale,
    translationFileContents: {}
  };
  for ( const repo of repos ) {

    // Iterate through each repo and store the translation file contents long-term.
    preparedTranslation.translationFileContents[ repo ] = await makeTranslationFileContentsForRepo( repo, translation );
  }

  logger.info( `prepared translation of ${translation.locale}/${translation.simName} for long-term storage` );
  return preparedTranslation;
};

export default prepareTranslationForLongTermStorage;