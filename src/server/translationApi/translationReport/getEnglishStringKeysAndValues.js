// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets a sim or library's English string keys and their values (their strings).
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getRepoNameFromStringKeyWithRepoName from '../getRepoNameFromStringKeyWithRepoName.js';
import getStringFile from '../getStringFile.js';
import getStringKeyFromStringKeyWithRepoName from '../getStringKeyFromStringKeyWithRepoName.js';
import logger from '../logger.js';

/**
 * Return sim or library's English string keys and their values (their strings) from the remote repository they live
 * in.
 *
 * @param {String} simOrLibName - sim or library (common repo) we want English string keys and strings from
 * @param {String[]} stringKeysWithRepoName - list of REPO_NAME/stringKey extracted from sim HTML
 * @param {String} shaOrBranch - the SHA of the sim you want data from or, by default, the master branch
 * @returns {Promise<Object>} - English string keys and their values (their strings)
 */
const getEnglishStringKeysAndValues = async ( simOrLibName, stringKeysWithRepoName, shaOrBranch = 'master' ) => {
  logger.info( 'getting english string keys and values' );
  const englishStringKeysAndValues = {};
  const englishStringData = await getStringFile( simOrLibName, shaOrBranch );
  for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    if ( simOrLibName === repoName ) {
      if ( englishStringData[ stringKey ] ) {
        englishStringKeysAndValues[ stringKey ] = englishStringData[ stringKey ].value;
      }
    }
  }
  logger.info( 'got english string keys and values; returning them' );
  return englishStringKeysAndValues;
};

export default getEnglishStringKeysAndValues;