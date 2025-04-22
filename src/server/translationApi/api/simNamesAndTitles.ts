// Copyright 2022, University of Colorado Boulder

/**
 * Define functionality for the "sim names and titles" route in the Express server, which returns an object where the
 * keys are the names of all the sims in repo-name format (e.g. build-an-atom) and the values are their title strings
 * (e.g. "Build an Atom").
 *
 * @param req - Express request object
 * @param res - Express response object
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import isTeamMember from '../isTeamMember.js';
import logger from '../logger.js';

const simNamesAndTitles = async ( req: Request, res: Response ): Promise<void> => {
  logger.info( 'responding with sim names and titles' );

  res.json( getSimNamesAndTitles( await getSimMetadata(), isTeamMember( req ) ) );
};

export default simNamesAndTitles;