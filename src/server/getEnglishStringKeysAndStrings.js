// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import config from './config.js';
import logger from './logger.js';

const getEnglishStringKeysAndStrings = async ( simOrLibName, shaOrBranch = 'master' ) => {
  let englishStringKeysAndStrings;
  try {
    const englishStringsKeysAndStringsUrl = `${config.GITHUB_URL}/${simOrLibName}/${shaOrBranch}/${simOrLibName}-strings_en.json`;
    const englishStringKeysAndStringsRes = await axios.get( englishStringsKeysAndStringsUrl );
    englishStringKeysAndStrings = englishStringKeysAndStringsRes.data;
    logger.info( 'got english strings; returning them' );
  }
  catch( e ) {
    logger.error( e );
  }
  return englishStringKeysAndStrings;
};

export { getEnglishStringKeysAndStrings as default };