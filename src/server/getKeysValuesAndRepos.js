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
 *     joist: {
 *       stringKeyA: {
 *         english: "Foo",
 *         translated: "Faa",
 *       },
 *       stringKeyB: {
 *         english: "Bar",
 *         translated: "Bur",
 *       },
 *       ...
 *     },
 *     scenery: {
 *       stringKeyC: {
 *         english: "Baz",
 *         translated: "Buz"
 *       },
 *       stringKeyD: {
 *         english: "Boop",
 *         translated: "Buup"
 *       },
 *       ...
 *     },
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
 * @param simName - sim name
 * @param locale
 * @param simNames - list of all sim names
 * @param stringKeysWithRepoName
 * @param categorizedStringKeys
 * @returns {Promise<{simSpecific: {}, common: {}}>}
 */
const getKeysValuesAndRepos = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {
  console.time( 'getKeysValuesAndRepos' );

  // initialize our object
  const keysValuesAndRepos = {
    common: {},
    simSpecific: {}
  };

  // we need common repos for the sim
  const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

  // we need to get common string keys
  const commonStringKeys = categorizedStringKeys.common;

  // we get an object that maps common repos to lists of string keys that belong to those repos
  const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

  // for each repo, we want to add a field to the common object
  for ( const repo of Object.keys( repoNameToStringKeys ) ) {

    // add the repo field
    keysValuesAndRepos.common[ repo ] = {};

    // get english file
    const commonEnglishStringFileUrl = getStringFileUrl( repo );
    const commonEnglishStringFileRes = await axios.get( commonEnglishStringFileUrl );
    const commonEnglishStringKeysAndStrings = commonEnglishStringFileRes.data;

    // get translated file
    const commonTranslatedStringFileUrl = getTranslatedStringFile( simName, locale );
    const commonTranslatedStringFileRes = await axios.get( commonTranslatedStringFileUrl );
    const commonTranslatedStringKeysAndStrings = commonTranslatedStringFileRes.data;

    /*
     * For each string key in a repo, we need to:
     * (1) get its English value and its translated value,
     * (2) add the string key to the repo object, and
     * (3) add the English value and the translated value to the string key object.
     */
    for ( const stringKey of repoNameToStringKeys[ repo ] ) {

      // get english value
      let englishValue = '';
      if ( Object.keys( commonEnglishStringKeysAndStrings ).includes( stringKey ) ) {
        englishValue = commonEnglishStringKeysAndStrings[ stringKey ].value;
      }

      // get translated value
      let translatedValue = '';
      if ( Object.keys( commonTranslatedStringKeysAndStrings ).includes( stringKey ) ) {
        translatedValue = commonTranslatedStringKeysAndStrings[ stringKey ].value;
      }

      // add english and translated values to a newly created string key field
      keysValuesAndRepos.common[ repo ][ stringKey ] = {
        english: englishValue,
        translated: translatedValue
      };
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