// Copyright 2022, University of Colorado Boulder

/**
 * Export a shared function, see function header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import privateConfig from '../../common/privateConfig.js';
import publicConfig from '../../common/publicConfig.js';
import { StringEntry, TranslationFormData } from '../../common/TranslationFormData.js';
import { CategorizedStringKeys } from './getCategorizedStringKeys.js';
import getCommonTranslationFormData from './getCommonTranslationFormData.js';
import getPrototypeStatus from './getPrototypeStatus.js';
import getSharedTranslationFormData from './getSharedTranslationFormData.js';
import { shortTermStringStorageCollection } from './getShortTermStringStorageCollection.js';
import getSimSpecificTranslationFormData from './getSimSpecificTranslationFormData.js';
import logger from './logger.js';

/**
 * Check for a saved translation and, if one doesn't exist or can't be obtained, get Thea simulation's string keys,
 * the English value for those keys, the translated values if they exist, and the repo name for common-code and shared
 * string keys. (Sim-specific string keys don't need a repo name field because it will be obvious to the caller of the
 * function what the sim repo is).
 *
 * @param simName - sim name
 * @param locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param simNames - list of all sim names
 * @param stringKeysWithRepoName - list of REPO_NAME/stringKey from the sim
 * @param categorizedStringKeys - string keys categorized into common and shared
 * @param userId - user ID number from the website user data
 * @returns A promise resolving to the translation form data
 */
const getTranslationFormData = async ( simName: string,
                                       locale: string,
                                       simNames: string[],
                                       stringKeysWithRepoName: string[],
                                       categorizedStringKeys: CategorizedStringKeys,
                                       userId: number ): Promise<TranslationFormData> => {

  logger.info( 'getting translation form data' );

  // Try to get a saved translation from the short-term storage database.
  if ( privateConfig.DB_ENABLED ) {
    try {
      logger.info( 'checking for saved translation' );

      // Get user id; depends on whether we're running on localhost or on a server.
      if ( publicConfig.ENVIRONMENT === 'development' ) {
        userId = publicConfig.LOCAL_USER_ID;
      }

      // Try to get saved translation in short-term storage database.
      const filter = {
        userId: userId,
        simName: simName,
        locale: locale
      };
      const savedTranslation = await shortTermStringStorageCollection.findOne( filter );
      if ( savedTranslation ) {
        logger.info( 'found saved translation; returning it' );
        return savedTranslation.translationFormData as TranslationFormData;
      }
      logger.info( 'no saved translation found' );
    }
    catch( e ) {
      logger.error( e );
    }
  }
  else {
    logger.warn( 'short-term string storage database not enabled, skipping attempt to retrieve' );
  }

  // Otherwise, get translation form data the normal way.
  const translationFormData: TranslationFormData = {
    simIsPrototype: false,
    simSpecific: {},
    common: {},
    shared: {}
  };

  try {
    translationFormData.simIsPrototype = await getPrototypeStatus( simName );
    translationFormData.simSpecific = getSortedStringsObject( await getSimSpecificTranslationFormData(
      simName,
      locale,
      categorizedStringKeys.simSpecific
    ) );
    translationFormData.shared = await getSharedTranslationFormData(
      locale,
      categorizedStringKeys.shared,
      categorizedStringKeys.sharedSims
    );
    translationFormData.common = await getCommonTranslationFormData(
      simName,
      locale,
      simNames,
      stringKeysWithRepoName,
      categorizedStringKeys.common
    );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'got translation form data; returning it' );
  return translationFormData;
};

/**
 * Sort the strings object by title, screen, and other keys.  This is done to keep the title and screens at the top of
 * the translation form.  See https://github.com/phetsims/rosetta/issues/454 for more detail on the motivation for this.
 * @param strings - The strings object to sort.
 * @returns A new object with sorted keys.
 */
const getSortedStringsObject = ( strings: Record<string, StringEntry> ): Record<string, StringEntry> => {
  const titleKeys: string[] = [];
  const screenKeys: string[] = [];
  const otherKeys: string[] = [];

  // Categorize keys.
  Object.keys( strings ).forEach( key => {
    if ( key.includes( '.title' ) || key.includes( '_DOT_title' ) ) {
      titleKeys.push( key );
    }
    else if ( key.includes( 'screen.' ) || key.includes( 'screen_DOT_' ) ) {
      screenKeys.push( key );
    }
    else {
      otherKeys.push( key );
    }
  } );

  // Sort each category.
  titleKeys.sort();
  screenKeys.sort();
  otherKeys.sort();

  // Combine sorted keys.
  const sortedKeys = [ ...titleKeys, ...screenKeys, ...otherKeys ];

  // Create a new object with sorted keys.
  const sortedObject: Record<string, StringEntry> = {};
  sortedKeys.forEach( key => {
    sortedObject[ key ] = strings[ key ];
  } );

  return sortedObject;
};

export default getTranslationFormData;