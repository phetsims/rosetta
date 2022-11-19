// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets a sim or library's English string keys and their values (their strings).
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from '../../../common/config.js';
import getRepoNameFromStringKeyWithRepoName from '../getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from '../getStringKeyFromStringKeyWithRepoName.js';
import logger from '../logger.js';

// import getSimHtml from '../getSimHtml.js';
// import getSimUrl from '../getSimUrl.js';
// import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';

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
  logger.info( 'getting english string keys and strings' );
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
  Object.keys( stringKeysWithRepoName ).forEach( stringKeyWithRepoName => {
    const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
    const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
    if ( simOrLibName === repoName ) {
      if ( englishStringData[ stringKey ] ) {
        englishStringKeysAndValues[ stringKey ] = englishStringData[ stringKey ].value;
      }
    }
  } );
  logger.info( 'got english string keys and strings; returning them' );
  return englishStringKeysAndValues;
};

// ( async () => {
//   const simUrl = getSimUrl( 'acid-base-solutions' );
//   const simHtml = await getSimHtml( simUrl );
//   const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
//   const res = await getEnglishStringKeysAndValues( 'acid-base-solutions', stringKeysWithRepoName );
//   console.log( JSON.stringify( res, null, 4 ) );
// } )();

export default getEnglishStringKeysAndValues;