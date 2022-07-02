// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that maps common repos to lists of string keys in those repos.
 *
 * @author Liam Mulhall
 */

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';

/**
 * Return an object that maps common repos to lists of string keys in those repos.
 *
 * @param {String[]} stringKeysWithRepoName - stringKey/REPO_NAME we get from a sim's HTML
 * @param {String[]} commonRepos - list of common repos
 * @param {String[]} commonStringKeys - list of common string keys
 * @returns {{[]}} - an object of objects where the sub-object keys are common repo names and the sub-object values are
 *                   lists of string keys that belong to those repos
 */
const getRepoNameToStringKeys = ( stringKeysWithRepoName, commonRepos, commonStringKeys ) => {
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
  return repoNameToStringKeys;
};

export default getRepoNameToStringKeys;