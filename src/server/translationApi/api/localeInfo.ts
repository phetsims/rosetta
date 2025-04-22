// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for locale info API route.  Responds with the locale info that we get from the phetsims/chipper
 * repository.
 *
 * @param req - Express request object
 * @param res - Express response object
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import getLocaleInfo from '../getLocaleInfo.js';
import logger from '../logger.js';

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