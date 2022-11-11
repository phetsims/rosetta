// Copyright 2022, University of Colorado Boulder

import express from 'express';
import os from 'os';
import { URL } from 'url';
import path from 'path';

const builtReactAppServer = express();

// Set up a variable similar to the old __dirname variable.
// The __dirname variable gets the present working directory.
const __dirname = new URL( '.', import.meta.url ).pathname;

// This is the path to the static files generated when you build the React front end.
const staticAssetsPath = path.join( __dirname, '..', '..', 'client', 'dist' );

// There's some weirdness on Windows; an extra slash is added before the path.
const staticAssetsPathWithoutLeadingSlash = staticAssetsPath
  .slice( 1, staticAssetsPath.length );

// If we get any route, hand it over to the React app so that it can do client-side routing.
builtReactAppServer.get( '/*', ( req, res ) => {
  if ( os.platform() === 'win32' ) {
    res.sendFile( path.join( staticAssetsPathWithoutLeadingSlash, 'index.html' ) );
  }
  else {
    res.sendFile( path.join( staticAssetsPath, 'index.html' ) );
  }
} );

export default builtReactAppServer;