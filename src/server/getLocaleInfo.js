// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import config from './config.js';
import logger from './logger.js';

const getLocaleInfo = async () => {
  logger.info( 'getting locale info' );
  let localeInfo;
  try {
    const localeInfoUrl = `${config.GITHUB_URL}/chipper/master/data/localeInfo.json`;
    localeInfo = await axios.get( localeInfoUrl );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'got locale info; returning it' );
  return localeInfo.data;
};

export { getLocaleInfo as default };