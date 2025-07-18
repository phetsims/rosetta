// Copyright 2021-2022, University of Colorado Boulder

/**
 * This file is the entry point for Rosetta's server-side code. It sets up the Express app, which has two components:
 * (1) the built React app server, and
 * (2) the translation API.
 *
 * (1) is responsible for serving the static files generated when we build the React front end. (2) is responsible for
 * returning JSON data that the React front end consumes.
 *
 * @author Liam Mulhall
 */

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import os from 'os';
import path from 'path';
import { URL } from 'url';
import config, { pathToConfig } from '../common/config.js';
import builtReactAppServer from './builtReactAppServer/builtReactAppServer.js';
import mockSignOut from './translationApi/api/mockSignOut.js';
import mockWebsiteUserData from './translationApi/api/mockWebsiteUserData.js';
import getCurrentRosettaSha from './translationApi/getCurrentRosettaSha.js';
import logger from './translationApi/logger.js';

// These are components (1) and (2) mentioned above.
import translationApi from './translationApi/translationApi.js';

const app = express();

const DEV_SERVER_PORT = 5173;

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );
if ( config.ENVIRONMENT === 'development' ) {

  // Allow CORS requests from the React front end.
  // This is only needed for local development.
  app.use( cors( {
    origin: `http://127.0.0.1:${DEV_SERVER_PORT}`
  } ) );
  app.use( ( req, res, next ) => {
    res.setHeader( 'Access-Control-Allow-Credentials', 'true' );
    next();
  } );
}

// Set up a variable similar to the old __dirname variable.
// The __dirname variable gets the present working directory.
const __dirname = new URL( '.', import.meta.url ).pathname;

// This is the path to the static files generated when you build the React front end.
const builtReactFilesPath = path.join( __dirname, '..', 'client', 'dist' );

// There's some weirdness on Windows; an extra slash is added before the path.
const builtReactFilesPathWithoutLeadingSlash = builtReactFilesPath
  .slice( 1, builtReactFilesPath.length );

/*
 * NOTE
 * We serve these static files using app as opposed to builtReactAppServer because if we use builtReactAppServer it
 * tries to serve all the files in the static directory as HTML instead of whatever their file type is, e.g. CSS or JS.
 */
if ( os.platform() === 'win32' ) {
  app.use( express.static( builtReactFilesPathWithoutLeadingSlash ) );
}
else {
  app.use( express.static( builtReactFilesPath ) );
}

// Set up route for serving JSON data consumed by the React front end.
app.use( '/translate/api', translationApi );

// Set up route for serving the built React app files.
app.use( '/translate', builtReactAppServer );

// Mock website user data for local development.
if ( config.ENVIRONMENT === 'development' ) {
  app.get( '/services/check-login', mockWebsiteUserData );
  app.get( '/services/logout', mockSignOut );
}

app.listen( config.ROSETTA_PORT, () => {
  logger.info( 'rosetta started' );
  logger.info( `http://localhost:${config.ROSETTA_PORT}/translate` );

  // Log private config keys except for secret ones.
  const unsafeKeys = [ 'BUILD_SERVER_AUTH', 'GITHUB_PAT', 'SERVER_TOKEN' ];
  logger.info( `config (from ${pathToConfig}):` );
  for ( const [ key, value ] of Object.entries( config ) ) {
    if ( !unsafeKeys.includes( key ) ) {
      logger.info( `    ${key}: ${value}` );
    }
  }

  // Log some information about the runtime environment that may be useful for debugging.
  logger.info( 'Runtime environment info:' );
  const sha = getCurrentRosettaSha();
  logger.info( `    rosetta SHA: ${sha}` );
  logger.info( `    NodeJS Version: ${process.versions.node}` );
} );