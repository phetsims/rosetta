// Copyright 2021, University of Colorado Boulder

import logger from '../logger.js';

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