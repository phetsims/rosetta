// Copyright 2023, University of Colorado Boulder

/**
 * Route that shows whether a translation report should show translation statistics.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import getRemainingGHRequests from '../getRemainingGHRequests.js';
import logger from '../logger.js';

// We can make 5000 requests per hour, and there are about 100 sims. A typical sim requires 8 requests to get its
// translation report, so one translation report requires about 800 requests (100 sims * 8 request/sim). Of course, this
// number will increase as we publish more sims.
const REQUEST_LIMIT = 900;

/**
 * Rosetta relies heavily on interactions with GitHub because it uses the phetsims/babel repo to store translations.
 * GitHub has a rate limit of 5000 requests per hour (as of this writing). This endpoint shows whether Rosetta is in
 * danger of exceeding that limit. For more info on this, see https://github.com/phetsims/rosetta/issues/410.
 * Specifically, see https://github.com/phetsims/rosetta/issues/410#issuecomment-1563781403.
 *
 * This route is meant to be used by the client-side code that deals with the translation report.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const showStats = async ( req: Request, res: Response ): Promise<void> => {
  const remainingGHRequests = await getRemainingGHRequests();
  const showStats = remainingGHRequests > REQUEST_LIMIT;
  logger.info( 'client wants to know whether to show translation stats' );
  logger.info( `remaining github requests: ${remainingGHRequests}` );
  logger.info( `request limit is set to: ${REQUEST_LIMIT}` );
  logger.info( `should show stats: ${showStats}` );
  res.send( remainingGHRequests > REQUEST_LIMIT );
};

export default showStats;