// Copyright 2022, University of Colorado Boulder

/**
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameToStringKeys from './getRepoNameToStringKeys.js';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFile from './getTranslatedStringFileUrl.js';

const getCommonKeysValuesAndRepos = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {

  const common = {};

  // we need common repos for the sim
  const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

  // we need to get common string keys
  const commonStringKeys = categorizedStringKeys.common;

  // we get an object that maps common repos to lists of string keys that belong to those repos
  const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

  // for each repo, we want to get an english string file and a translated string file
  for ( const repo of Object.keys( repoNameToStringKeys ) ) {

    // get english file
    const commonEnglishStringFileUrl = getStringFileUrl( repo );
    const commonEnglishStringFileRes = await axios.get( commonEnglishStringFileUrl );
    const commonEnglishStringKeysAndStrings = commonEnglishStringFileRes.data;

    // get translated file
    const commonTranslatedStringFileUrl = getTranslatedStringFile( repo, locale );
    const commonTranslatedStringFileRes = await axios.get( commonTranslatedStringFileUrl );
    const commonTranslatedStringKeysAndStrings = commonTranslatedStringFileRes.data;

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
      /*
       * Here we assume the string key is no longer used, i.e. its string file doesn't have the string key anymore.
       * It's possible that a sim could have a string "no longer used" so I added a nonsense word "gooble".
       */
      let translatedValue = 'no longer used gooble';
      if ( Object.keys( commonTranslatedStringKeysAndStrings ).includes( stringKey ) ) {
        translatedValue = commonTranslatedStringKeysAndStrings[ stringKey ].value;
      }

      // add the string key, its english value, translated value, and repo name to the common object
      if ( englishValue !== 'no longer used gooble' && translatedValue !== 'no longer used gooble' ) {
        common[ stringKey ] = {
          english: englishValue,
          translated: translatedValue,
          repo: repo
        };
      }
    }
  }

  return common;
};

export default getCommonKeysValuesAndRepos;