// Copyright 2022, University of Colorado Boulder

/* eslint-disable default-import-match-filename */

/**
 * Export a function that gets a sim's common string keys, their English values, and their translated values.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameToStringKeys from './getRepoNameToStringKeys.js';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFile from './getTranslatedStringFileUrl.js';
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

    // we need common repos for the sim
    const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

    // we get an object that maps common repos to lists of string keys that belong to those repos
    const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

    // for each repo, we want to get an english string file and a translated string file
    for ( const repo of Object.keys( repoNameToStringKeys ) ) {

      // get english file
      // the english file should exist
      // if it doesn't exist, we've got a serious problem, houston
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

      // get translated file
      // the translated file might not exist
      let commonTranslatedStringFileUrl = '';
      let commonTranslatedStringFileRes = {};
      let commonTranslatedStringKeysAndStrings = {};
      try {
        commonTranslatedStringFileUrl = getTranslatedStringFile( repo, locale );
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

      /*
       * For each string key in a repo, we need to:
       * (1) get its English value and its translated value, and
       * (2) add the string key and its English value, translated value, and repo name to the common object.
       */
      for ( const stringKey of repoNameToStringKeys[ repo ] ) {

        // get english value
        /*
         * Here we assume the string key is no longer used, i.e. its string file doesn't have the string key anymore.
         * It's possible that a sim could have a string "no longer used" so I added a nonsense word "gooble".
         */
        let englishValue = 'no longer used gooble';
        if ( Object.keys( commonEnglishStringKeysAndStrings ).includes( stringKey ) ) {
          englishValue = commonEnglishStringKeysAndStrings[ stringKey ].value;
        }

        // get translated value
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

        // add the string key, its english value, translated value, and repo name to the common object
        if ( englishValue !== 'no longer used gooble' ) {
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