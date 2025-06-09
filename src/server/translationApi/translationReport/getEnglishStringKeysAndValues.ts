// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets a sim or library's English string keys and their values (their strings).
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { StringKeysAndValues } from '../ServerDataTypes.js';
import getRepoNameFromStringKeyWithRepoName from '../getRepoNameFromStringKeyWithRepoName.js';
import getEnglishStringFile from '../getEnglishStringFile.js';
import getStringKeyFromStringKeyWithRepoName from '../getStringKeyFromStringKeyWithRepoName.js';
import logger from '../logger.js';

/**
 * Return sim or library's English string keys and their values, which are the strings that appear in the simulation,
 * from the remote repository in which they live.
 *
 * @param simOrLibName - sim or library (common repo) we want English string keys and strings from
 * @param stringKeysWithRepoName - list of REPO_NAME/stringKey extracted from sim HTML
 * @param shaOrBranch - the SHA of the sim you want data from or, by default, the main branch
 * @returns - English string keys and their values (their strings)
 */
const getEnglishStringKeysAndValues = async ( simOrLibName: string,
                                              stringKeysWithRepoName: string[],
                                              shaOrBranch = 'main' ): Promise<StringKeysAndValues> => {

  logger.info( 'getting English string keys and values' );
  const englishStringKeysAndValues: StringKeysAndValues = {};
  const englishStringData = await getEnglishStringFile( simOrLibName, shaOrBranch );
  for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    if ( simOrLibName === repoName && englishStringData[ stringKey ] ) {
      englishStringKeysAndValues[ stringKey ] = englishStringData[ stringKey ].value;
    }
  }
  logger.info( 'got English string keys and values, returning them' );
  return englishStringKeysAndValues;
};

export default getEnglishStringKeysAndValues;