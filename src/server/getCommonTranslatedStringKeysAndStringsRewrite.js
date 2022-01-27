// Copyright 2022, University of Colorado Boulder

import getCommonRepos from './getCommonRepos.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';

const getCommonTranslatedStringKeysAndStringsRewrite = async ( simName, simNames, stringKeysWithRepoName ) => {

  // get a list of common repos for the sim
  const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

  /*
   * We want a data structure that looks like:
   *
   * repoName1: [stringKeyA, stringKeyB, stringKeyC]
   * repoName2: [stringKeyD, stringKeyE, stringKeyF]
   * repoName3: [stringKeyG, stringKeyH, stringKeyI]
   * ...
   * repoNameN: [stringKeyX, stringKeyY, stringKeyZ]
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
      repoNameToStringKeys[ repoName ].push( stringKey );
    }
  }

  console.log( repoNameToStringKeys );

  // todo: for each repo, get its string file
  // todo: for each string key, extract its value from the string file
};

export default getCommonTranslatedStringKeysAndStringsRewrite;