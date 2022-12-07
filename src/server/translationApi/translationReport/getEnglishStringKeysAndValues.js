// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets a sim or library's English string keys and their values (their strings).
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import config from '../../../common/config.js';
import getRepoNameFromStringKeyWithRepoName from '../getRepoNameFromStringKeyWithRepoName.js';
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
  const englishStringFileUrl = `${config.GITHUB_URL}/${simOrLibName}/${shaOrBranch}/${simOrLibName}-strings_en.json`;
  let englishStringData = {};
  try {
    const englishStringDataRes = await axios.get( englishStringFileUrl );
    englishStringData = englishStringDataRes.data;
  }
  catch( e ) {
    logger.error( 'unable to get english string data' );
    logger.error( e );
  }
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