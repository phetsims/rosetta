// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets locale info.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from '../common/config.js';
import logger from './logger.js';

/**
 * Return the locale info stored in a remote repository. This locale info contains names of locales and locale codes.
 *
 * @returns {Promise<Object>} - locale info, i.e. names of locales and ISO 639-1 locale codes
 */
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

export default getLocaleInfo;