// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets locale info.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from '../../common/config.js';
import logger from './logger.js';

let timeOfLastUpdate = Number.NEGATIVE_INFINITY;

let localeInfo;

/**
 * Return the locale info stored in a remote repository. This locale info contains names of locales and locale codes.
 *
 * @returns {Promise<Object> | Object} - locale info, i.e. names of locales and ISO 639-1 locale codes
 */
const getLocaleInfo = async () => {
  logger.info( 'getting locale info' );
  try {
    const localeInfoValidDurationElapsed = timeOfLastUpdate
                                           + Number( config.server.VALID_LOCALE_INFO_DURATION ) < Date.now();

    /*
     * We use cached locale info unless the locale info has become stale (i.e. the valid locale info duration has
     * elapsed). Note: This doesn't handle the case where two requests for locale info are made in quick succession.
     * If the translation utility sees a lot of use, it might make sense to handle this case.
     */
    if ( localeInfoValidDurationElapsed ) {
      logger.info( 'locale info is stale or nonexistent; getting it' );
      const localeInfoUrl = `${config.server.GITHUB_URL}/chipper/master/data/localeInfo.json`;
      const localeInfoRes = await axios.get( localeInfoUrl );
      localeInfo = localeInfoRes.data;

      // Delete the English locale; we don't want people translating it.
      delete localeInfo.en;

      // We ignore this ESLint rule because a race condition here won't be problematic.
      /* eslint-disable require-atomic-updates */
      timeOfLastUpdate = Date.now();
    }
    else {
      logger.info( 'using cached locale info' );
    }
  }
  catch( e ) {
    logger.error( e );
    localeInfo = { error: 'unable to get locale info' };
  }
  logger.info( 'got locale info; returning it' );
  return localeInfo;
};

export default getLocaleInfo;