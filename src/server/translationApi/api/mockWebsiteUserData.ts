// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for mock website user data API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import publicConfig from '../../../common/publicConfig.js';
import logger from '../logger.js';

/**
 * API function. Send mock website user data. This is only used for development. You can modify the user data to suit
 * your development needs.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const mockWebsiteUserData = ( req: Request, res: Response ): void => {
  const mockWebsiteUserData = {
    username: 'PhET Girl',
    userId: publicConfig.LOCAL_USER_ID,
    email: 'phet.girl@colorado.edu',
    loggedIn: true,
    teamMember: true,
    trustedTranslator: true,
    subscribed: true
  };
  logger.info( 'responding with mock website user data' );
  res.json( mockWebsiteUserData );
};

export default mockWebsiteUserData;