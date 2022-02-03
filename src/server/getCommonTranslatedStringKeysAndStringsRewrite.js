// Copyright 2022, University of Colorado Boulder

import axios from 'axios';
import getCommonRepos from './getCommonRepos.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const getCommonTranslatedStringKeysAndStringsRewrite = async ( simName, locale, simNames, stringKeysWithRepoName ) => {

  const commonTranslatedStringKeysAndStrings = new Map(); // eslint-disable-line

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

  // for each common repo from which the sim gets string keys...
  for ( const repo in repoNameToStringKeys ) {

    // get the string file url
    const translatedStringFileUrl = getTranslatedStringFileUrl( repo, locale );
    console.log( translatedStringFileUrl );

    try {

      // try to get the contents stored at the string file url
      const translatedStringKeysAndStringsRes = await axios.get( translatedStringFileUrl );
      const translatedStringKeysAndStrings = translatedStringKeysAndStringsRes.data; // eslint-disable-line

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

  console.log( [ ...commonTranslatedStringKeysAndStrings ] );

  // todo: reorder map according to the order of categorizedStringKeys.common
};

export default getCommonTranslatedStringKeysAndStringsRewrite;