// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that first checks for a saved translation and if it can't find one gets a simulation's string keys,
 * the English value for the string key, the translated value for the string key, and the repo name for the string key
 * if it is a common string key. (Sim-specific string keys don't need a repo name field because it will be obvious to
 * the caller of the function what the sim repo is.)
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

// Uncomment this import of you want a local copy of translation form data.
// import fs from 'fs';

import privateConfig from '../../common/privateConfig.js';
import publicConfig from '../../common/publicConfig.js';
import getCommonTranslationFormData from './getCommonTranslationFormData.js';
import getPrototypeStatus from './getPrototypeStatus.js';
import getSharedTranslationFormData from './getSharedTranslationFormData.js';
import { shortTermStringStorageCollection } from './getShortTermStringStorageCollection.js';
import getSimSpecificTranslationFormData from './getSimSpecificTranslationFormData.js';
import logger from './logger.js';

/*
 * If we can't find a saved translation, we want to return an object that looks like:
 *
 * {
 *   common: {
 *     stringKeyA: {
 *       english: "Foo",
 *       translated: "Faa",
 *       repo: "scenery-phet"
 *     },
 *     stringKeyB: {
 *       english: "Bar",
 *       translated: "Bur",
 *       repo: "joist"
 *     }
 *     ...
 *   },
 *   sim-specific: {
 *     stringKeyE: {
 *       english: "Bing",
 *       translated: "Bong"
 *     },
 *     stringKeyF: {
 *       english: "Ding",
 *       translated: "Dong"
 *     },
 *     ...
 *   }
 * }
 */

/**
 * Check for a saved translation and if one isn't found return an object like the one above. This object is used to
 * render the translation form. The repo fields are used by the server when it submits a translation to long-term
 * storage. The repos are not used by the client. If a saved translation is found, we simply return that.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {String[]} simNames - list of all sim names
 * @param {String[]} stringKeysWithRepoName - list of REPO_NAME/stringKey from the sim
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and
 * @param {String} userId - user ID number from the website user data
 * @returns {Promise<{simSpecific: {}, common: {}}>} - translation form data
 */
const getTranslationFormData = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys,
  userId = undefined
) => {
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
        userId: Number( userId ), // See https://github.com/phetsims/rosetta/issues/373.
        simName: simName,
        locale: locale
      };
      const savedTranslation = await shortTermStringStorageCollection.findOne( filter );
      if ( savedTranslation ) {

        logger.info( 'found saved translation; returning it' );

        // noinspection JSValidateTypes
        return savedTranslation.translationFormData;
      }
      logger.info( 'no saved translation found' );
    }
    catch( e ) {
      logger.error( e );
    }
  }
  else {
    logger.warn( 'short-term string storage database not enabled; check your config' );
  }

  // Otherwise, get translation form data the normal way.
  const translationFormData = {
    simIsPrototype: false,
    simSpecific: {},
    common: {}
  };
  try {
    translationFormData.simIsPrototype = await getPrototypeStatus( simName );
    translationFormData.simSpecific = await getSimSpecificTranslationFormData(
      simName,
      locale,
      categorizedStringKeys.simSpecific
    );
    translationFormData.shared = await getSharedTranslationFormData(
      simName,
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

    // Uncomment this code if you want a local copy of translation form data.
    // fs.writeFileSync( './translationFormData.json', JSON.stringify( translationFormData, null, 4 ) );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'got translation form data; returning it' );
  return translationFormData;
};

export default getTranslationFormData;