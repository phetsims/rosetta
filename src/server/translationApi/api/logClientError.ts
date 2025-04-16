// Copyright 2022, University of Colorado Boulder

/**
 * Logs errors that are coming from the client
 *
 * @author Agustín Vallejo
 */

import { Request, Response } from 'express';
import logger from '../logger.js';

/**
 * API function. Returns the response to the client and logs the error message.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const logClientError = ( req: Request, res: Response ): void => {
  const { errorMessage }: { errorMessage: string } = req.body;
  logger.error( `Client error reported: ${errorMessage}` );
  res.status( 200 ).send( { status: 'logged' } );
};

export default logClientError;