// Copyright 2021, University of Colorado Boulder

// packages
const express = require( 'express' );
const path = require( 'path' );

// server modules
const config = require( './config.js' );
const logger = require( './logger.js' );

const app = express();

const staticAssetsPath = path.join( __dirname, '..', '..', 'static' );
app.use( express.static( staticAssetsPath ) );
app.get( '/translate', ( req, res ) => {
  res.sendFile( path.join( __dirname, '..', '..', 'static', 'index.html' ) );
} );

app.listen( config.SERVER_PORT, () => {
  logger.info( `rosetta started` );
} );