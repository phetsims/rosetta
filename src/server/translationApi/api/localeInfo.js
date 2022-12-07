// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for locale info API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getLocaleInfo from '../getLocaleInfo.js';
import logger from '../logger.js';

/**
 * API function. Send the locale info that we get from the phetsims/chipper repository.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} - locale info
 */
const localeInfo = async ( req, res ) => {
  try {
    const localeInfo = await getLocaleInfo();
    logger.info( 'responding with locale info' );
    res.json( localeInfo );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default localeInfo;