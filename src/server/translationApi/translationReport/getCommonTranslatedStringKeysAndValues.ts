// Copyright 2022, University of Colorado Boulder

/**
 * Export an object that returns an object containing common translated string keys and their values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { CategorizedStringKeys } from '../getCategorizedStringKeys.js';
import getCommonRepos from '../getCommonRepos.js';
import getRepoNameToStringKeys from '../getRepoNameToStringKeys.js';
import { StringKeysAndValues } from '../ServerDataTypes.js';
import { longTermStorage } from '../translationApi.js';

/**
 * Return an object containing common translated string keys and their values.
 *
 * @param simName - sim name
 * @param locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param simNames - list of all sim names
 * @param stringKeysWithRepoName - stringKey/REPO_NAME we get from a sim's HTML
 * @param categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns - ordered pairs of common translated string keys and their values (their strings)
 */
const getCommonTranslatedStringKeysAndValues = async (
  simName: string,
  locale: string,
  simNames: string[],
  stringKeysWithRepoName: string[],
  categorizedStringKeys: CategorizedStringKeys
): Promise<StringKeysAndValues> => {

  const commonTranslatedStringKeysAndStrings: StringKeysAndValues = {};
  const commonStringKeys = categorizedStringKeys.common;

  // Get a list of common repos for the sim.
  const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

  // Get a structure where the keys are the repo names that contain strings used in the sim and the values are lists of
  // string keys that are actually used in the sim.
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