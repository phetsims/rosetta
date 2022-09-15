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

import config from '../common/config.js';
import express from 'express';
import logger from './translationApi/logger.js';
import mockWebsiteUserData from './translationApi/api/mockWebsiteUserData.js';
import path from 'path';
import { URL } from 'url';

// These are components (1) and (2) mentioned above.
import translationApi from './translationApi/translationApi.js';
import staticAssetsServer from './staticAssetsServer/staticAssetsServer.js';

const app = express();

// Enable returning JSON.
app.use( express.json() );

// Set up a variable similar to the old __dirname variable.
// The __dirname variable gets the present working directory.
const __dirname = new URL( '.', import.meta.url ).pathname;

// This is the path to the static files generated when you build the React front end.
const staticAssetsPath = path.join( __dirname, '..', 'client', 'dist' );

/*
 * We serve these static files using app as opposed to staticFileServer because if we use staticFileServer it tries to
 * serve all the files in the static directory as HTML instead of whatever their file type is, e.g. CSS or JS.
 */
app.use( express.static( staticAssetsPath ) );

// Set up route for serving JSON data consumed by the React front end.
app.use( '/translationApi', translationApi );

// Set up route for serving the static files.
app.use( '/translate', staticAssetsServer );

// Mock website user data for local development.
if ( config.ENVIRONMENT === 'development' ) {
  app.get( '/services/check-login', mockWebsiteUserData );
}

app.listen( config.SERVER_PORT, () => {
  logger.info( 'rosetta started' );
  logger.info( `http://localhost:${config.SERVER_PORT}/translate` );

  const unsafeKeys = [ 'BUILD_SERVER_AUTH', 'GITHUB_PAT', 'SERVER_TOKEN', 'ROSETTA_SESSION_SECRET' ];

  const configKeysToLog = Object.keys( config ).filter( key => !unsafeKeys.includes( key ) );
  logger.info( 'see config below' );
  for ( const key of configKeysToLog ) {
    logger.info( `    ${key}: ${config[ key ]}` );
  }
} );