// Copyright 2021, University of Colorado Boulder

/**
 * Provide functionality for mock website user data API route.
 *
 * @author Liam Mulhall
 */

import logger from '../logger.js';

/**
 * API function. Send mock website user data. This is only used for development. You can modify the user data to suit
 * your development needs.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const mockWebsiteUserData = ( req, res ) => {
  const mockWebsiteUserData = {
    username: 'PhET Girl',
    userId: 123456,
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