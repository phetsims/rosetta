// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the save translation API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import logger from '../logger.js';
import storeTranslationShortTerm from '../storeTranslationShortTerm.js';

/**
 * API function. Save a user's translation to the short-term storage database.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const saveTranslation = async ( req: Request, res: Response ): Promise<void> => {
  try {
    logger.info( `saving ${req.body.locale}/${req.body.simName} translation to short-term storage` );
    const storeResult = await storeTranslationShortTerm( req.body );
    res.send( storeResult );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default saveTranslation;