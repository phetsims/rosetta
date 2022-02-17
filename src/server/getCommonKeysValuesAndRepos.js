// Copyright 2022, University of Colorado Boulder

/**
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameToStringKeys from './getRepoNameToStringKeys.js';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFile from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const getCommonKeysValuesAndRepos = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {

  const common = {};

  try {

    // we need common repos for the sim
    const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

    // we need to get common string keys
    const commonStringKeys = categorizedStringKeys.common;

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

        // strip out the dots to make it easier for the client to parse the translation form data
        const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );

        // add the string key, its english value, translated value, and repo name to the common object
        if ( englishValue !== 'no longer used gooble' ) {
          common[ stringKeyWithoutDots ] = {
            english: englishValue,
            translated: translatedValue,    // the user will be able to modify this value
            oldTranslated: translatedValue, // the user won't be able to modify this value; it will be used for history
            repo: repo
          };
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }

  return common;
};

export default getCommonKeysValuesAndRepos;