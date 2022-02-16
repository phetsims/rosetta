// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a simulation's string keys, the English value for the string key, the translated value
 * for the string key, and the repo name for the string key if it is a common string key. (Sim-specific string keys
 * don't need a repo name field because it will be obvious to the caller of the function what the sim repo is.)
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameToStringKeys from './getRepoNameToStringKeys.js';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFile from './getTranslatedStringFileUrl.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';

/*
 * We want to return an object that looks like:
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
 * Return an object like the one above. This object is used to render the translation form. The repo fields are used by
 * the server when it submits a translation to long-term storage. The repos are not used by the client.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {String[]} simNames - list of all sim names
 * @param {String[]} stringKeysWithRepoName - list of REPO_NAME/stringKey from the sim
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<{simSpecific: {}, common: {}}>} - translation form data
 */
const getKeysValuesAndRepos = async ( simName, locale, simNames, stringKeysWithRepoName, categorizedStringKeys ) => {
  console.time( 'getKeysValuesAndRepos' );

  // initialize our object
  const keysValuesAndRepos = {
    common: {}, simSpecific: {}
  };

  // we need common repos for the sim
  const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

  // we need to get common string keys
  const commonStringKeys = categorizedStringKeys.common;

  // we get an object that maps common repos to lists of string keys that belong to those repos
  const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

  // for each repo, we want to get an enlish string file and a translated string file
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
        keysValuesAndRepos.common[ stringKey ] = {
          english: englishValue,
          translated: translatedValue,
          repo: repo
        };
      }
    }
  }

  // we need to get sim-specific string keys
  const simSpecificStringKeys = categorizedStringKeys.simSpecific;

  // we need the english string file for the sim
  const simSpecificEnglishStringFileUrl = getStringFileUrl( simName );
  const simSpecificEnglishStringFileRes = await axios.get( simSpecificEnglishStringFileUrl );
  const simSpecificEnglishStringKeysAndStrings = simSpecificEnglishStringFileRes.data;

  // we need the translated string file for the sim
  const simSpecificTranslatedStringFileUrl = getTranslatedStringFileUrl( simName, locale );
  const simSpecificTranslatedStringFileRes = await axios.get( simSpecificTranslatedStringFileUrl );
  const simSpecificTranslatedStringKeysAndStrings = simSpecificTranslatedStringFileRes.data;

  /*
   * For each sim-specific string key, we need to:
   * (1) get the string key's English value,
   * (2) get the string key's translated value, and
   * (3) add the string key and its values to the sim-specific object
   */
  for ( const stringKey of simSpecificStringKeys ) {

    // get the english value
    let englishValue = '';
    if ( simSpecificEnglishStringKeysAndStrings[ stringKey ] ) {
      englishValue = simSpecificEnglishStringKeysAndStrings[ stringKey ].value;
    }

    // get the translated value
    let translatedValue = '';
    if ( simSpecificTranslatedStringKeysAndStrings[ stringKey ] ) {
      translatedValue = simSpecificTranslatedStringKeysAndStrings[ stringKey ].value;
    }

    // add the string key and its values to the sim-specific object
    keysValuesAndRepos.simSpecific[ stringKey ] = {
      english: englishValue,
      translated: translatedValue
    };
  }

  console.timeEnd( 'getKeysValuesAndRepos' );
  return keysValuesAndRepos;
};

export default getKeysValuesAndRepos;