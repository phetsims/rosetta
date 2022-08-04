// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that first checks for a saved translation and if it can't find one gets a simulation's string keys,
 * the English value for the string key, the translated value for the string key, and the repo name for the string key
 * if it is a common string key. (Sim-specific string keys don't need a repo name field because it will be obvious to
 * the caller of the function what the sim repo is.)
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from '../common/config.js';
import getCommonTranslationFormData from './getCommonTranslationFormData.js';
import getSimSpecificTranslationFormData from './getSimSpecificTranslationFormData.js';
import logger from '../common/logger.js';
import { shortTermStringStorageCollection } from './getShortTermStringStorageCollection.js';

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
 *                                                                            sim-specific
 * @returns {Promise<{simSpecific: {}, common: {}}>} - translation form data
 */
const getTranslationFormData = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {
  logger.info( 'getting translation form data' );

  // try to get a saved translation from the short-term storage database
  if ( config.DB_ENABLED === 'true' ) {
    try {

      logger.info( 'checking for saved translation' );

      // get user id; depends on whether we're running on localhost or on a server
      let userId;
      if ( config.ENVIRONMENT === 'development' ) {
        userId = config.LOCAL_USER_ID;
      }
      else {
        const userDataRes = await axios.get( `${config.SERVER_URL}/services/check-login` );
        const userData = userDataRes.data;
        userId = userData.userId;
      }

      // try to get saved translation in short-term storage database
      const filter = {
        userId: parseInt( userId, 10 ),
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

  // otherwise, get translation form data the normal way
  console.time( 'getTranslationFormData' );
  const translationFormData = {
    simSpecific: {},
    common: {}
  };
  try {
    translationFormData.simSpecific = await getSimSpecificTranslationFormData(
      simName,
      locale,
      categorizedStringKeys.simSpecific
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
  console.timeEnd( 'getTranslationFormData' );
  logger.info( 'got translation form data; returning it' );
  return translationFormData;
};

export default getTranslationFormData;