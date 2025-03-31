// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for locale info API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import getLocaleInfo from '../getLocaleInfo.js';
import logger from '../logger.js';

/**
 * API function. Send the locale info that we get from the phetsims/chipper repository.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise that resolves after sending the response
 */
const localeInfo = async ( req: Request, res: Response ): Promise<void> => {
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