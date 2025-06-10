// Copyright 2022, University of Colorado Boulder

/**
 * Export a shared function, see function header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { RepoName, StringKey } from '../../common/TypeAliases.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import { ExtendedStringKey } from './ServerDataTypes.js';

/**
 * Given a list of extended string keys (where both the repo name and the key are included in a single string), return
 * an object that maps common repo names (e.g. joist) to lists of basic string keys in those repos.
 *
 * @param stringKeysWithRepoName - list of stringKey/REPO_NAME we get from a sim's string map, e.g.
 *                                 "JOIST/preferences.title".
 * @param commonRepos - list of common repos
 * @param commonStringKeys - list of common string keys
 * @returns An object where the keys are common repo names and their values are lists of string keys that are defined
 *          in each repo.
 */
const getRepoNameToStringKeys = ( stringKeysWithRepoName: ExtendedStringKey[],
                                  commonRepos: RepoName[],
                                  commonStringKeys: StringKey[] ): Record<RepoName, StringKey[]> => {

  const repoNameToStringKeys:Record<RepoName, StringKey[]> = {};
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