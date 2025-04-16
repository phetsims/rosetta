// Copyright 2022, University of Colorado Boulder

/**
 * Set up routes for the translation API.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import express, { NextFunction, Request, Response } from 'express';
import flushReportObject from './api/flushReportObject.js';
import localeInfo from './api/localeInfo.js';
import logClientError from './api/logClientError.js';
import saveTranslation from './api/saveTranslation.js';
import sha from './api/sha.js';
import showStats from './api/showStats.js';
import simNamesAndTitles from './api/simNamesAndTitles.js';
import submitTranslation from './api/submitTranslation.js';
import testTranslation from './api/testTranslation.js';
import translatedAndUntranslatedSims from './api/translatedAndUntranslatedSims.js';
import translationFormData from './api/translationFormData.js';
import translationReportEvents from './api/translationReportEvents.js';
import triggerBuild from './api/triggerBuild.js';
import logger from './logger.js';
import LongTermStorage from './LongTermStorage.js';
import ReportObjectCache from './translationReport/ReportObjectCache.js';

const rosettaApiServer = express();

const reportObjectCache = new ReportObjectCache();
const longTermStorage = new LongTermStorage();

rosettaApiServer.get( '/', ( req: Request, res: Response ): void => {
  res.send( 'Hello API!' );
} );

rosettaApiServer.get( '/*', ( req: Request, res: Response, next: NextFunction ): void => {
  logger.info( `get request received for ${req.url}` );
  next();
} );

rosettaApiServer.get( '/localeInfo', localeInfo );
rosettaApiServer.get( '/simNamesAndTitles', simNamesAndTitles );
rosettaApiServer.get( '/translationFormData/:simName?/:locale?', translationFormData );
rosettaApiServer.get( '/sha', sha );
rosettaApiServer.get( '/triggerBuild/:simName?/:locale?/:userId?', triggerBuild );
rosettaApiServer.get( '/translationReportEvents/:locale?', translationReportEvents );
rosettaApiServer.get( '/translatedAndUntranslatedSims/:locale?', translatedAndUntranslatedSims );
rosettaApiServer.get( '/flushReportObject/:locale?/:sim?', flushReportObject );
rosettaApiServer.get( '/showStats', showStats );

rosettaApiServer.post( '/*', ( req: Request, res: Response, next: NextFunction ): void => {
  logger.info( `post request received for ${req.url}` );
  next();
} );
rosettaApiServer.post( '/saveTranslation', saveTranslation );
rosettaApiServer.post( '/submitTranslation', submitTranslation );
rosettaApiServer.post( '/testTranslation', testTranslation );

rosettaApiServer.post( '/logClientError', logClientError );

export default rosettaApiServer;
export { reportObjectCache, longTermStorage };