// Copyright 2022, University of Colorado Boulder

/**
 * Export a shared function, see function header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';

/**
 * Return an object that maps common repo names (e.g. joist) to lists of string keys in those repos.
 *
 * @param stringKeysWithRepoName - list of stringKey/REPO_NAME we get from a sim's string map, e.g.
 *                                 "JOIST/preferences.title".
 * @param commonRepos - list of common repos
 * @param commonStringKeys - list of common string keys
 * @returns An object where the keys are common repo names and their values are lists of string keys that belong to each repo
 */
const getRepoNameToStringKeys = ( stringKeysWithRepoName: string[],
                                  commonRepos: string[],
                                  commonStringKeys: string[] ): Record<string, string[]> => {

  const repoNameToStringKeys: Record<string, string[]> = {};
  for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    if ( commonRepos.includes( repoName ) ) {
      repoNameToStringKeys[ repoName ] = repoNameToStringKeys[ repoName ] || [];
      if ( commonStringKeys.includes( stringKey ) ) {
        repoNameToStringKeys[ repoName ].push( stringKey );
      }
    }
  }
  return repoNameToStringKeys;
};

export default getRepoNameToStringKeys;