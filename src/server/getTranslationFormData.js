// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets a simulation's string keys, the English value for the string key, the translated value
 * for the string key, and the repo name for the string key if it is a common string key. (Sim-specific string keys
 * don't need a repo name field because it will be obvious to the caller of the function what the sim repo is.)
 *
 * @author Liam Mulhall
 */

import getCommonTranslationFormData from './getCommonTranslationFormData.js';
import getSimSpecificTranslationFormData from './getSimSpecificTranslationFormData.js';

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
  console.time( 'getTranslationFormData' );
  const keysValuesAndRepos = {
    simSpecific: {},
    common: {}
  };
  keysValuesAndRepos.simSpecific = await getSimSpecificTranslationFormData( simName, locale, categorizedStringKeys );
  keysValuesAndRepos.common = await getCommonTranslationFormData(
    simName,
    locale,
    simNames,
    stringKeysWithRepoName,
    categorizedStringKeys
  );
  console.timeEnd( 'getTranslationFormData' );
  return keysValuesAndRepos;
};

export default getTranslationFormData;