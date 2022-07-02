// Copyright 2021-2022, University of Colorado Boulder

/**
 * This file is the entry point for Rosetta's server-side code. It sets up the Express app, which has two components:
 * (1) the static file server, and
 * (2) the API server.
 *
 * (1) is responsible for serving the static files generated when we build the React front end. (2) is responsible for
 * returning JSON data that the React front end consumes.
 *
 * @author Liam Mulhall
 */

import config from './common/config.js';
import express from 'express';
import logger from './common/logger.js';
import mockWebsiteUserData from './rosettaApiServer/api/mockWebsiteUserData.js';

// These are components (1) and (2) mentioned above.
import rosettaApiServer from './rosettaApiServer/rosettaApiServer.js';
import staticServer from './staticServer/staticServer.js';

const app = express();

// Enable returning JSON.
app.use( express.json() );

// Set up route for serving JSON data consumed by the React front end.
app.use( '/rosettaApi', rosettaApiServer );

// Set up route for serving the static files.
app.use( '/translate', staticServer );

// Mock website user data for local development.
if ( config.ENVIRONMENT === 'development' ) {
  app.get( '/services/check-login', mockWebsiteUserData );
}

app.listen( config.SERVER_PORT, () => {
  logger.info( 'rosetta started' );
  logger.info( 'http://localhost:16372/translate' );
} );