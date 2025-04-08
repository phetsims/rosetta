// Copyright 2023, University of Colorado Boulder

/**
 * Mock sign out function for local testing.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import logger from '../logger.js';

const mockSignOut = ( req: Request, res: Response ): void => {
  logger.info( 'mocking sign out' );
  res.status( 200 ).send();
};

export default mockSignOut;