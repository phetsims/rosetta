// Copyright 2022, University of Colorado Boulder

/**
 * Send the SHA of the running instance of Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import getCurrentRosettaSha from '../getCurrentRosettaSha.js';
import logger from '../logger.js';

/**
 * API function. Respond with the current SHA of the running instance of Rosetta.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const sha = ( req: Request, res: Response ): void => {
  logger.info( 'responding with sha' );
  const sha = getCurrentRosettaSha();
  res.json( { sha: sha } );
};

export default sha;