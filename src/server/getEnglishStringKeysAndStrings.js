// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import config from './config.js';
import logger from './logger.js';

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