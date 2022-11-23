// Copyright 2022, University of Colorado Boulder

import express from 'express';
import localeInfo from './api/localeInfo.js';
import rebuildWithOriginalCredit from './api/rebuildWithOriginalCredit.js';
import saveTranslation from './api/saveTranslation.js';
import sha from './api/sha.js';
import simNamesAndTitles from './api/simNamesAndTitles.js';
import submitTranslation from './api/submitTranslation.js';
import testTranslation from './api/testTranslation.js';
import translationFormData from './api/translationFormData.js';
import logger from './logger.js';

const rosettaApiServer = express();

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
rosettaApiServer.get( '/rebuildWithOriginalCredit/:simName?/:locale?/:userId?', rebuildWithOriginalCredit );

// posts
rosettaApiServer.post( '/*', ( req, res, next ) => {
  logger.info( `post request received for ${req.url}` );
  next();
} );
rosettaApiServer.post( '/saveTranslation', saveTranslation );
rosettaApiServer.post( '/submitTranslation', submitTranslation );
rosettaApiServer.post( '/testTranslation', testTranslation );

export default rosettaApiServer;