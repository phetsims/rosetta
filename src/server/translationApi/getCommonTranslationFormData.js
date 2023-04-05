// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a sim's common string keys, their English values, and their translated values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { NO_LONGER_USED_FLAG } from '../../common/constants.js';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameToStringKeys from './getRepoNameToStringKeys.js';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

/*
 * We want to return an object that looks like:
 *
 * {
 *   stringKeyA: {
 *     english: "Foo",
 *     translated: "Faa",
 *     repo: "scenery-phet"
 *   },
 *   stringKeyB: {
 *     english: "Bar",
 *     translated: "Bur",
 *     repo: "joist"
 *   }
 *   ...
 * }
 */

/**
 * Return an object that contains a sim's common string keys, their English values, and their translated values.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {String[]} simNames - string keys categorized into common and sim-specific
 * @param {String[]} stringKeysWithRepoName - list of REPO_NAME/stringKey from the sim
 * @param {string[]} commonStringKeys - list of common string keys for the sim
 * @returns {Promise<{}>} - common string keys, their English values, and their translated values
 */
const getCommonTranslationFormData = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  commonStringKeys
) => {

  logger.info( 'getting common translation form data' );

  const common = {};

  try {
    const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );
    const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

    for ( const repo of Object.keys( repoNameToStringKeys ) ) {

      // The English file should exist.
      let commonEnglishStringFileUrl = '';
      let commonEnglishStringFileRes = {};
      let commonEnglishStringKeysAndStrings = {};
      try {
        commonEnglishStringFileUrl = getStringFileUrl( repo );
        commonEnglishStringFileRes = await axios.get( commonEnglishStringFileUrl );
        commonEnglishStringKeysAndStrings = commonEnglishStringFileRes.data;
      }
      catch( e ) {
        logger.error( e );
      }

      // The translated file might not exist.
      let commonTranslatedStringFileUrl = '';
      let commonTranslatedStringFileRes = {};
      let commonTranslatedStringKeysAndStrings = {};
      try {
        commonTranslatedStringFileUrl = getTranslatedStringFileUrl( repo, locale );
        commonTranslatedStringFileRes = await axios.get( commonTranslatedStringFileUrl );
        commonTranslatedStringKeysAndStrings = commonTranslatedStringFileRes.data;
      }
      catch( e ) {
        if ( e.response.status === 404 ) {
          logger.verbose( `translation file for ${repo} doesn't exist; setting empty strings for ${repo}` );
        }
        else {
          logger.error( e );
        }
      }

      for ( const stringKey of repoNameToStringKeys[ repo ] ) {

        // If the English value of the string is empty, it doesn't make sense to present
        // the string to the translator. The translator won't be able to translate an
        // empty string. See https://github.com/phetsims/rosetta/issues/388.
        if (
          Object.keys( commonEnglishStringKeysAndStrings ).includes( stringKey )
          && commonEnglishStringKeysAndStrings[ stringKey ].value === ''
        ) {
          continue;
        }

        // Here we assume the string key is no longer used, i.e. its string file doesn't have the string key anymore.
        let englishValue = NO_LONGER_USED_FLAG;
        if ( Object.keys( commonEnglishStringKeysAndStrings ).includes( stringKey ) ) {
          englishValue = commonEnglishStringKeysAndStrings[ stringKey ].value;
        }

        let translatedValue = '';
        if ( Object.keys( commonTranslatedStringKeysAndStrings ).includes( stringKey ) ) {
          translatedValue = commonTranslatedStringKeysAndStrings[ stringKey ].value;
        }

        /*
         * This strips the dots out of the string keys and replaces them with strings. We do this because the dots cause
         * the client to think there are more deeply nested keys when there aren't. For example, a string key like
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
         * but (B) is obviously wrong. The below snippet makes (A) look like
         *
         * (C)
         * "acid-base-solutions_DOT_title": {
         *    "value": "Acid-Base Solutions"
         * }
         *
         * and the translation form data is sent to the client as in (C). When we get the translation form data back from
         * the client in a submission, we transform the data from (C) back to (A).
         */
        const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );

        // Add the string key, its english value, translated value, and repo name to the common object.
        if ( englishValue !== NO_LONGER_USED_FLAG ) {
          common[ stringKeyWithoutDots ] = {
            english: englishValue,
            translated: translatedValue,
            repo: repo
          };
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }

  logger.info( 'got common translation form data; returning it' );

  return common;
};

export default getCommonTranslationFormData;