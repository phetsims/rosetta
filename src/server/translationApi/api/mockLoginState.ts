// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for mock website user data API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Request, Response } from 'express';
import config from '../../../common/config.js';
import { LoginState } from '../../../common/LoginState.js';
import logger from '../logger.js';

/**
 * API function. Send mock website user data. This is only used for development. You can modify the user data to suit
 * your development needs.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
const mockLoginState = ( req: Request, res: Response ): void => {
  const mockLoginState: LoginState = {
    phetUserId: config.LOCAL_USER_ID,
    email: 'phet.girl@colorado.edu',
    loggedIn: true,
    isTeamMember: true,
    isTrustedTranslator: true
  };
  logger.info( 'responding with mock website user data' );
  res.json( mockLoginState );
};

export default mockLoginState;