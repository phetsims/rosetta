// Copyright 2022, University of Colorado Boulder

/**
 * Export an object that returns an object containing common translated string keys and their values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getCommonRepos from '../getCommonRepos.js';
import getRepoNameToStringKeys from '../getRepoNameToStringKeys.js';
import { longTermStorage } from '../translationApi.js';

/**
 * Return an object containing common translated string keys and their values.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {String[]} simNames - list of all sim names
 * @param {String[]} stringKeysWithRepoName - stringKey/REPO_NAME we get from a sim's HTML
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<Object>} - ordered pairs of common translated string keys and their values (their strings)
 */
const getCommonTranslatedStringKeysAndValues = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {

  const commonTranslatedStringKeysAndStrings = {};
  const commonStringKeys = categorizedStringKeys.common;

  // Get a list of common repos for the sim.
  const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

  /*
   * We want a data structure that looks like:
   *
   * {
   *   repoName1: [stringKeyA, stringKeyB, stringKeyC]
   *   repoName2: [stringKeyD, stringKeyE, stringKeyF]
   *   repoName3: [stringKeyG, stringKeyH, stringKeyI]
   *   ...
   *   repoNameN: [stringKeyX, stringKeyY, stringKeyZ]
   * }
   *
   * For each repo, we will get its string file. Then we will get the value for each string key in the list of string
   * keys for that repo.
   */

  // Create the above data structure.
  const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

  // For each common repo from which the sim gets string keys...
  for ( const repo in repoNameToStringKeys ) {

    const translatedStringKeysAndValues = await longTermStorage.get( repo, locale );

    // For each string key associated with the repo, extract its value from the string file.
    for ( const stringKey of repoNameToStringKeys[ repo ] ) {
      if ( translatedStringKeysAndValues[ stringKey ] ) {
        commonTranslatedStringKeysAndStrings[ stringKey ] = translatedStringKeysAndValues[ stringKey ].value;
      }
      else {
        commonTranslatedStringKeysAndStrings[ stringKey ] = '';
      }
    }
  }

  return commonTranslatedStringKeysAndStrings;
};

export default getCommonTranslatedStringKeysAndValues;