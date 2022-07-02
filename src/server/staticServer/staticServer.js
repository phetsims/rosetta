// Copyright 2022, University of Colorado Boulder

import express from 'express';
import { URL } from 'url';
import path from 'path';

const staticServer = express();

// Set up a variable similar to the old __dirname variable.
// The __dirname variable gets the present working directory.
const __dirname = new URL( '.', import.meta.url ).pathname;

// This is the path to the static files generated when you build the React front end.
const staticAssetsPath = path.join( __dirname, '..', '..', '..', 'static' );

// Enable serving static files.
staticServer.use( express.static( staticAssetsPath ) );

// If we get any route, hand it over to the React app so that it can do client-side routing.
staticServer.get( '/*', ( req, res ) => {
  res.sendFile( path.join( staticAssetsPath, 'index.html' ) );
} );

export default staticServer;