// Copyright 2021, University of Colorado Boulder

const express = require( 'express' );
const path = require( 'path' );

const PORT = 3000;
const STATIC_ASSETS_PATH = path.join( __dirname, '..', '..', 'static' );

const app = express();

app.use( express.static( STATIC_ASSETS_PATH ) );
app.get( '/translate', ( req, res ) => {
  res.sendFile( path.join( __dirname, '..', '..', 'static', 'index.html' ) );
} );

app.listen( PORT, () => console.log( `http://localhost:${PORT}` ) );