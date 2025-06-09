// Copyright 2021-2022, University of Colorado Boulder

/**
 * Transform translation data submitted by a translator into the format needed for long-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import { ClientSubmittedTranslationData } from '../../common/ClientSubmittedTranslationData.js';
import { MultiRepoTranslationData, SimTranslationData } from './ServerDataTypes.js';
import getStringKeysWithDots from './getStringKeysWithDots.js';
import logger from './logger.js';
import makeTranslationFileContentsForRepo from './makeTranslationFileContentsForRepo.js';

const prepareTranslationForLongTermStorage = async (
  translation: ClientSubmittedTranslationData
): Promise<SimTranslationData> => {

  logger.info( `preparing translation of ${translation.locale}/${translation.simName} for long-term storage` );
  logger.info( 'adding back dots to translation form data from client' );
  translation.translationFormData.simSpecific = getStringKeysWithDots( translation.translationFormData.simSpecific );
  translation.translationFormData.common = getStringKeysWithDots( translation.translationFormData.common );
  translation.translationFormData.shared = getStringKeysWithDots( translation.translationFormData.shared );

  // Get a list of repos whose strings are in the translation.
  const repos: string[] = [ translation.simName ];
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

  // For each repo in the translation data and make its translation file contents.
  const multiRepoTranslationData: MultiRepoTranslationData = {};
  for ( const repo of repos ) {
    multiRepoTranslationData[ repo ] = await makeTranslationFileContentsForRepo( repo, translation );
  }

  logger.info( `prepared translation of ${translation.locale}/${translation.simName} for long-term storage` );
  return {
    simName: translation.simName,
    locale: translation.locale,
    multiRepoTranslationData: multiRepoTranslationData
  };
};

export default prepareTranslationForLongTermStorage;