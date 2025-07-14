// Copyright 2022, University of Colorado Boulder

/**
 * Export a shared function, see function header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import config from '../../common/config.js';
import { SimSpecificTranslationFormStrings, TranslationFormData } from '../../common/TranslationFormData.js';
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
  if ( config.DB_ENABLED ) {
    try {
      logger.info( 'checking for saved translation' );

      // Get user id; depends on whether we're running on localhost or on a server.
      if ( config.ENVIRONMENT === 'development' ) {
        userId = config.LOCAL_USER_ID;
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
    const unsortedSimSpecificFormData = await getSimSpecificTranslationFormData(
      simName,
      locale,
      categorizedStringKeys.simSpecific
    );

    // Sort the object so that the strings are in the order we want them to be in the translation form.
    translationFormData.simSpecific = getSortedStringsObject( simName, unsortedSimSpecificFormData );

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
 * @param simName - The name of the simulation whose strings are being sorted.
 * @param strings - The strings object to sort.
 * @returns A new object with sorted keys.
 */
const getSortedStringsObject = (
  simName: string,
  strings: SimSpecificTranslationFormStrings
): SimSpecificTranslationFormStrings => {

  const titleKeys: string[] = [];
  const screenKeys: string[] = [];
  const otherKeys: string[] = [];
  const a11yKeys: string[] = [];

  let titleKey: string | null = null;

  // Categorize keys, separating out accessibility ('a11y') keys to appear at the end.
  Object.keys( strings ).forEach( stringKey => {
    if ( stringKey.includes( 'a11y' ) ) {
      a11yKeys.push( stringKey );
    }
    else if ( stringKey.includes( '.title' ) || stringKey.includes( '_DOT_title' ) ) {
      if ( stringKey.includes( simName ) ) {
        titleKey = stringKey;
      }
      else {
        titleKeys.push( stringKey );
      }
    }
    else if ( stringKey.includes( 'screen.' ) || stringKey.includes( 'screen_DOT_' ) ) {
      screenKeys.push( stringKey );
    }
    else {
      otherKeys.push( stringKey );
    }
  } );

  // Sort each category, including a11y keys.
  titleKeys.sort();
  screenKeys.sort();
  otherKeys.sort();
  a11yKeys.sort();

  // Put the sim title key at the top of the list.
  if ( titleKey ) {
    titleKeys.unshift( titleKey );
  }

  // Combine sorted keys, with a11y keys at the end.
  const sortedKeys = [ ...titleKeys, ...screenKeys, ...otherKeys, ...a11yKeys ];

  // Create a new object with sorted keys.
  const sortedObject: SimSpecificTranslationFormStrings = {};
  sortedKeys.forEach( key => {
    sortedObject[ key ] = strings[ key ];
  } );

  return sortedObject;
};

export default getTranslationFormData;