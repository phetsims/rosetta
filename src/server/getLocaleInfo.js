// Copyright 2021, University of Colorado Boulder

// packages
import axios from 'axios';

// server modules
import config from './config.js';
import logger from './logger.js';

const getLocaleInfo = async () => {
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