// Copyright 2021, University of Colorado Boulder

import saveTranslation from './api/saveTranslation.js';
import commonEnglishStringKeysAndStrings from './api/tmp/commonEnglishStringKeysAndStrings.js';
import commonTranslatedStringKeysAndStrings from './api/tmp/commonTranslatedStringKeysAndStrings.js';
import config from './config.js';
import express from 'express';
import localeInfo from './api/localeInfo.js';
import logger from './logger.js';
import mockWebsiteUserData from './api/mockWebsiteUserData.js';
import path from 'path';
import simNames from './api/simNames.js';
import simSpecificEnglishStringKeysAndStrings from './api/tmp/simSpecificEnglishStringKeysAndStrings.js';
import simSpecificTranslatedStringKeysAndStrings from './api/tmp/simSpecificTranslatedStringKeysAndStrings.js';
import translationFormData from './api/translationFormData.js';
import { URL } from 'url';

// constants
const app = express();
const __dirname = new URL( '.', import.meta.url ).pathname;
const staticAssetsPath = path.join( __dirname, '..', '..', 'static' );

// middleware
app.use( express.static( staticAssetsPath ) );
app.use( express.json() );

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
app.get( '/translate/api/translationFormData/:simName?/:locale?', translationFormData );

// mock website user data for local development
if ( config.ENVIRONMENT === 'development' ) {

  // not sure what webstorm is barking about here
  app.get( '/services/check-login', mockWebsiteUserData );
}

// temporary api gets for manual testing
app.get( '/translate/api/tmp/commonEnglishStringKeysAndStrings/:simName?', commonEnglishStringKeysAndStrings );
app.get( '/translate/api/tmp/simSpecificEnglishStringKeysAndStrings/:simName?', simSpecificEnglishStringKeysAndStrings );
app.get( '/translate/api/tmp/commonTranslatedStringKeysAndStrings/:simOrLibName?/:locale?', commonTranslatedStringKeysAndStrings );
app.get( '/translate/api/tmp/simSpecificTranslatedStringKeysAndStrings/:simName?/:locale?', simSpecificTranslatedStringKeysAndStrings );

// api posts
app.post( '/translate/api/saveTranslation', saveTranslation );

app.listen( config.SERVER_PORT, () => {
  logger.info( 'rosetta started' );
  logger.info( 'http://localhost:16372/translate' );
} );