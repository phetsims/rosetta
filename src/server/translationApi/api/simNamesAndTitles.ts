// Copyright 2022, University of Colorado Boulder

/**
 * Define functionality for the sim names and titles route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import logger from '../logger.js';

/**
 * Respond with an object whose keys are sim names and whose values are sim titles.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const simNamesAndTitles = async ( req: Request, res: Response ): Promise<void> => {
  logger.info( 'responding with sim names and titles' );

  res.json( getSimNamesAndTitles( await getSimMetadata(), req.query.isTeamMember === 'true' ) );
};

export default simNamesAndTitles;