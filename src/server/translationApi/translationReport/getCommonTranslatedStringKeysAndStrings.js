// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns an array of arrays. Each sub-array has two elements: (1) a common translated string
 * key, and (2) the string corresponding to (1).
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from '../getCommonRepos.js';
import getRepoNameToStringKeys from '../getRepoNameToStringKeys.js';
import getTranslatedStringFileUrl from '../getTranslatedStringFileUrl.js';
import logger from '../../common/logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a common translated string key followed by its value
 * (its string). This is implemented as an array of arrays where each sub-array has two elements, namely the common
 * translated string key and its string.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {String[]} simNames - list of all sim names
 * @param {String[]} stringKeysWithRepoName - stringKey/REPO_NAME we get from a sim's HTML
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<String[][]>} - ordered pairs of common translated string keys and their values (their strings)
 */
const getCommonTranslatedStringKeysAndStrings = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {

  console.time( 'getCommonTranslatedStringKeysAndStrings' );
  const commonTranslatedStringKeysAndStrings = new Map();
  const commonStringKeys = categorizedStringKeys.common;

  // get a list of common repos for the sim
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

  // create the above data structure
  const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

  // for each common repo from which the sim gets string keys...
  for ( const repo in repoNameToStringKeys ) {

    // get the string file url
    const translatedStringFileUrl = getTranslatedStringFileUrl( repo, locale );

    // try to get the contents stored at the string file url
    try {
      const translatedStringKeysAndStringsRes = await axios.get( translatedStringFileUrl );
      const translatedStringKeysAndStrings = translatedStringKeysAndStringsRes.data;

      // for each string key associated with the repo, extract its value from the string file
      for ( const stringKey of repoNameToStringKeys[ repo ] ) {
        if ( translatedStringKeysAndStrings[ stringKey ] ) {
          commonTranslatedStringKeysAndStrings.set( stringKey, translatedStringKeysAndStrings[ stringKey ].value );
        }
        else {
          commonTranslatedStringKeysAndStrings.set( stringKey, '' );
        }
      }
    }
    catch( e ) {

      // if there is no string file, then there hasn't been a translation that affects the repo
      if ( e.response.status === 404 ) {
        logger.verbose( `translated string file doesn't exist; setting empty strings for ${repo}` );
        for ( const stringKey of repoNameToStringKeys[ repo ] ) {
          commonTranslatedStringKeysAndStrings.set( stringKey, '' );
        }
      }
      else {
        logger.error( e );
      }
    }
  }

  // sort list according to the order of string keys in common categorized string keys
  const sortedCommonTranslatedStringKeysAndStrings = new Map();
  for ( const stringKey of commonStringKeys ) {
    const stringValue = commonTranslatedStringKeysAndStrings.get( stringKey );

    // if there is a value for the string key
    if ( stringValue ) {
      sortedCommonTranslatedStringKeysAndStrings.set( stringKey, stringValue );
    }

    // if there isn't a value for the string key
    else {
      sortedCommonTranslatedStringKeysAndStrings.set( stringKey, '' );
    }
  }

  console.timeEnd( 'getCommonTranslatedStringKeysAndStrings' );
  return [ ...sortedCommonTranslatedStringKeysAndStrings ];
};

export default getCommonTranslatedStringKeysAndStrings;