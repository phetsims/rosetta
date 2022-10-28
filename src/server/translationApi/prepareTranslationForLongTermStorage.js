// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that transforms a translation into the format that expected for long-term storage string files.
 *
 * @author Liam Mulhall
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

  /*
   * We strip the dots out of the string keys and replace them with strings before we send translation form
   * data to the client. We do this because the dots cause the client to think there are more deeply nested
   * keys when there aren't. For example, a string key like
   *
   * (A)
   * "acid-base-solutions.title": {
   *    "value": "Acid-Base Solutions"
   * }
   *
   * would confuse the client. The client would think that it's looking for something like
   *
   * (B)
   * "acid-base-solutions": {
   *    "title": {
   *      "value": "Acid-Base Solutions"
   *    }
   * }
   *
   * but (B) is obviously wrong. We made (A) look like
   *
   * (C)
   * "acid-base-solutions_DOT_title": {
   *    "value": "Acid-Base Solutions"
   * }
   *
   * and we sent the translation form data to the client as in (C). Now that we have the translation form data back
   * from the client, we transform the data from (C) back to (A).
   */
  logger.info( 'adding back dots to translation form data from client' );
  translation.translationFormData.simSpecific = getStringKeysWithDots( translation.translationFormData.simSpecific );
  translation.translationFormData.common = getStringKeysWithDots( translation.translationFormData.common );

  // get a list of repos whose strings are in the translation
  const repos = [ translation.simName ];
  const commonData = translation.translationFormData.common;
  for ( const stringKey of Object.keys( commonData ) ) {
    const commonRepo = commonData[ stringKey ].repo;
    if ( !repos.includes( commonRepo ) ) {
      repos.push( commonRepo );
    }
  }

  // for each repo in the translation, make its translation file contents
  const preparedTranslation = {
    simName: translation.simName,
    locale: translation.locale,
    translationFileContents: {}
  };
  for ( const repo of repos ) {

    // we will iterate through each repo and store the translation file contents long-term
    preparedTranslation.translationFileContents[ repo ] = await makeTranslationFileContentsForRepo( repo, translation );
  }

  logger.info( `prepared translation of ${translation.locale}/${translation.simName} for long-term storage` );
  return preparedTranslation;
};

export default prepareTranslationForLongTermStorage;