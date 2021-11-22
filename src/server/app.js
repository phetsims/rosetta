// Copyright 2021, University of Colorado Boulder

import commonEnglishStringKeysAndStrings from './api/tmp/commonEnglishStringKeysAndStrings.js';
import config from './config.js';
import express from 'express';
import localeInfo from './api/localeInfo.js';
import logger from './logger.js';
import path from 'path';
import simNames from './api/simNames.js';
import { URL } from 'url';

// constants
const app = express();
const __dirname = new URL( '.', import.meta.url ).pathname;
const staticAssetsPath = path.join( __dirname, '..', '..', 'static' );

// middleware
app.use( express.static( staticAssetsPath ) );

// log info about get request
app.get( '/translate*', ( req, res, next ) => {
  logger.info( `get request ${req.url}` );
  next();
} );

// serve static index.html file
app.get( '/translate', ( req, res ) => {
  res.sendFile( path.join( __dirname, '..', '..', 'static', 'index.html' ) );
} );

// api gets
app.get( '/translate/api/localeInfo', localeInfo );
app.get( '/translate/api/simNames', simNames );

// temporary api gets for manual testing
app.get( '/translate/api/tmp/commonEnglishStringKeysAndStrings/:simName?', commonEnglishStringKeysAndStrings );
app.get( '/translate/api/tmp/commonTranslatedStringKeysAndStrings/:simName?/:locale?', commonEnglishStringKeysAndStrings );

app.listen( config.SERVER_PORT, () => {
  logger.info( 'rosetta started' );
  logger.info( 'http://localhost:16372/translate' );
} );