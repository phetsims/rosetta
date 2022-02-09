// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns an array of arrays. Each sub-array has two elements: (1) a common translated string
 * key, and (2) the string corresponding to (1).
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a common translated string key followed by its value
 * (its string). This is implemented as an array of arrays where each sub-array has two elements, namely the common
 * translated string key and its string.
 *
 * @param {String} simName
 * @param {String} locale
 * @param {String[]} simNames
 * @param {String[]} stringKeysWithRepoName
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys
 * @returns {Promise<String[][]>}
 */
const getCommonTranslatedStringKeysAndStringsRewrite = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {

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
  const repoNameToStringKeys = {};
  for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );

    // if the repo is a common repo, create an empty list of string keys for it or update the list of string keys
    if ( commonRepos.includes( repoName ) ) {
      repoNameToStringKeys[ repoName ] = repoNameToStringKeys[ repoName ] || [];

      // if the string key is included in the list of common string keys
      if ( commonStringKeys.includes( stringKey ) ) {
        repoNameToStringKeys[ repoName ].push( stringKey );
      }
    }
  }

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

  // reorder map according to the order of string keys in common categorized string keys
  const sortedCommonTranslatedStringKeysAndStrings = [ ...commonTranslatedStringKeysAndStrings ]; // not sorted yet
  sortedCommonTranslatedStringKeysAndStrings.sort( ( a, b ) => {
    return commonStringKeys.indexOf( a ) - commonStringKeys.indexOf( b );
  } ); // now they're sorted

  return sortedCommonTranslatedStringKeysAndStrings;
};

export default getCommonTranslatedStringKeysAndStringsRewrite;