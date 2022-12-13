// Copyright 2022, University of Colorado Boulder

import express from 'express';
import localeInfo from './api/localeInfo.js';
import triggerBuild from './api/triggerBuild.js';
import saveTranslation from './api/saveTranslation.js';
import sha from './api/sha.js';
import simNamesAndTitles from './api/simNamesAndTitles.js';
import submitTranslation from './api/submitTranslation.js';
import testTranslation from './api/testTranslation.js';
import translatedAndUntranslatedSims from './api/translatedAndUntranslatedSims.js';
import translationFormData from './api/translationFormData.js';
import logger from './logger.js';
import translationReportEvents from './api/translationReportEvents.js';
import ReportObjectCache from './ReportObjectCache.js';

const rosettaApiServer = express();

const reportObjectCache = new ReportObjectCache();

rosettaApiServer.get( '/', ( req, res ) => {
  res.send( 'Hello API!' );
} );

// gets
rosettaApiServer.get( '/*', ( req, res, next ) => {
  logger.info( `get request received for ${req.url}` );
  next();
} );
rosettaApiServer.get( '/localeInfo', localeInfo );
rosettaApiServer.get( '/simNamesAndTitles', simNamesAndTitles );
rosettaApiServer.get( '/translationFormData/:simName?/:locale?', translationFormData );
rosettaApiServer.get( '/sha', sha );
rosettaApiServer.get( '/triggerBuild/:simName?/:locale?/:userId?', triggerBuild );
rosettaApiServer.get( '/translationReportEvents/:locale?/:numberOfEvents?', translationReportEvents );
rosettaApiServer.get( '/translatedAndUntranslatedSims/:locale?', translatedAndUntranslatedSims );

// posts
rosettaApiServer.post( '/*', ( req, res, next ) => {
  logger.info( `post request received for ${req.url}` );
  next();
} );
rosettaApiServer.post( '/saveTranslation', saveTranslation );
rosettaApiServer.post( '/submitTranslation', submitTranslation );
rosettaApiServer.post( '/testTranslation', testTranslation );

export default rosettaApiServer;
export { reportObjectCache };