// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets a sim or library's English string keys and their values (their strings).
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from './config.js';
import logger from './logger.js';

/**
 * Return sim or library's English string keys and their values (their strings) from the remote repository they live
 * in.
 *
 * @param {String} simOrLibName - sim or library (common repo) we want English string keys and strings from
 * @param {String} shaOrBranch - the SHA or the branch name for the sim (if not provided, will default to master)
 * @returns {Promise<Object>} - English string keys and their values (their strings)
 */
const getEnglishStringKeysAndStrings = async ( simOrLibName, shaOrBranch = 'master' ) => {
  logger.info( `getting ${shaOrBranch}/${simOrLibName}'s english string keys and strings` );
  let englishStringKeysAndStrings;
  try {
    const englishStringsKeysAndStringsUrl = `${config.GITHUB_URL}/${simOrLibName}/${shaOrBranch}/${simOrLibName}-strings_en.json`;
    const englishStringKeysAndStringsRes = await axios.get( englishStringsKeysAndStringsUrl );
    englishStringKeysAndStrings = englishStringKeysAndStringsRes.data;
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${shaOrBranch}/${simOrLibName}'s english string keys and strings; returning them` );
  return englishStringKeysAndStrings;
};

export default getEnglishStringKeysAndStrings;