// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a sim's common string keys, their English values, and their translated values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { NO_LONGER_USED_FLAG } from '../../common/constants.js';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameToStringKeys from './getRepoNameToStringKeys.js';
import getStringFile from './getStringFile.js';
import logger from './logger.js';
import { longTermStorage } from './translationApi.js';

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
      const commonEnglishStringKeysAndStrings = await getStringFile( repo );

      // The translated file might not exist.
      const commonTranslatedStringKeysAndStrings = await longTermStorage.get( repo, locale );

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

        // For more info on this, see the explanation in the getStringKeysWithDots module.
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