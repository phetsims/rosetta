// Copyright 2021-2022, University of Colorado Boulder

import commonEnglishStringKeysAndStrings from './api/tmp/commonEnglishStringKeysAndStrings.js';
import commonTranslatedStringKeysAndStrings from './api/tmp/commonTranslatedStringKeysAndStrings.js';
import config from './config.js';
import express from 'express';
import localeInfo from './api/localeInfo.js';
import getSimHtml from './getSimHtml.js';
import getSimNames from './getSimNames.js';
import getSimUrl from './getSimUrl.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';
import mockWebsiteUserData from './api/mockWebsiteUserData.js';
import path from 'path';
import saveTranslation from './api/saveTranslation.js';
import simNames from './api/simNames.js';
import simSpecificEnglishStringKeysAndStrings from './api/tmp/simSpecificEnglishStringKeysAndStrings.js';
import simSpecificTranslatedStringKeysAndStrings from './api/tmp/simSpecificTranslatedStringKeysAndStrings.js';
import submitTranslation from './api/submitTranslation.js';
import translationFormData from './api/translationFormData.js';
import { URL } from 'url';
import getCommonTranslatedStringKeysAndStringsRewrite from './getCommonTranslatedStringKeysAndStringsRewrite.js';

// constants
const app = express();
const __dirname = new URL( '.', import.meta.url ).pathname;
const staticAssetsPath = path.join( __dirname, '..', '..', 'static' );

// middleware
app.use( express.static( staticAssetsPath ) );
app.use( express.json() );

// todo: remove when done
// test getCommonTranslatedStringKeysAndStringsRewrite
( async () => {
  const simName = 'acid-base-solutions';
  const simUrl = getSimUrl( simName );
  const simHtml = await getSimHtml( simUrl );
  const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
  const simNames = await getSimNames();
  await getCommonTranslatedStringKeysAndStringsRewrite( simName, simNames, stringKeysWithRepoName );
} )();

// log info about get request
app.get( '/translate*', ( req, res, next ) => {
  logger.info( `get request ${req.url}` );
  next();
} );

// serve static index.html file
app.get( '/translate', ( req, res ) => {
  logger.info( 'serving static index.html file' );
  res.sendFile( path.join( __dirname, '..', '..', 'static', 'index.html' ) );
} );

// if we get a request for a route that isn't an api route, redirect to the first page of the translation tool
// this can happen if the user reloads the page when their path is something like translate/ab/acid-base-solutions
// we don't have routes for every single locale/sim combination; that's handled with client-side routing
app.get( '/translate/*', ( req, res, next ) => {
  if ( !req.path.includes( 'api' ) ) {
    logger.info( 'not an api route; redirecting user to the first page of the translation tool' );
    res.redirect( '/translate' );
  }
  next();
} );

// api gets
app.get( '/translate/api/localeInfo', localeInfo );
app.get( '/translate/api/simNames', simNames );
app.get( '/translate/api/translationFormData/:simName?/:locale?', translationFormData );

// mock website user data for local development
if ( config.ENVIRONMENT === 'development' ) {
  app.get( '/services/check-login', mockWebsiteUserData );
}

// temporary api gets for manual testing
app.get( '/translate/api/tmp/commonEnglishStringKeysAndStrings/:simName?', commonEnglishStringKeysAndStrings );
app.get( '/translate/api/tmp/simSpecificEnglishStringKeysAndStrings/:simName?', simSpecificEnglishStringKeysAndStrings );
app.get( '/translate/api/tmp/commonTranslatedStringKeysAndStrings/:simName?/:locale?', commonTranslatedStringKeysAndStrings );
app.get( '/translate/api/tmp/simSpecificTranslatedStringKeysAndStrings/:simName?/:locale?', simSpecificTranslatedStringKeysAndStrings );

// api posts
app.post( '/translate/api/saveTranslation', saveTranslation );
app.post( '/translate/api/submitTranslation', submitTranslation );

app.listen( config.SERVER_PORT, () => {
  logger.info( 'rosetta started' );
  logger.info( 'http://localhost:16372/translate' );
} );