// Copyright 2022, University of Colorado Boulder

import commonEnglishStringKeysAndStrings from './api/tmp/commonEnglishStringKeysAndStrings.js';
import commonTranslatedStringKeysAndStrings from './api/tmp/commonTranslatedStringKeysAndStrings.js';
import express from 'express';
import localeInfo from './api/localeInfo.js';
import logger from './logger.js';
import saveTranslation from './api/saveTranslation.js';
import sha from './api/sha.js';
import simNames from './api/simNames.js';
import simSpecificEnglishStringKeysAndStrings from './api/tmp/simSpecificEnglishStringKeysAndStrings.js';
import simSpecificTranslatedStringKeysAndStrings from './api/tmp/simSpecificTranslatedStringKeysAndStrings.js';
import submitTranslation from './api/submitTranslation.js';
import testTranslation from './api/testTranslation.js';
import translationFormData from './api/translationFormData.js';
import triggerBuild from './api/triggerBuild.js';

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
rosettaApiServer.get( '/simNames', simNames );
rosettaApiServer.get( '/translationFormData/:simName?/:locale?', translationFormData );
rosettaApiServer.get( '/sha', sha );
rosettaApiServer.get( '/triggerBuild/:simName?/:locale?/:userId?', triggerBuild );

// These might be used in the translation report. (Currently unused, hence the tmp directory.)
rosettaApiServer.get( '/tmp/commonEnglishStringKeysAndStrings/:simName?', commonEnglishStringKeysAndStrings );
rosettaApiServer.get( '/tmp/simSpecificEnglishStringKeysAndStrings/:simName?', simSpecificEnglishStringKeysAndStrings );
rosettaApiServer.get( '/tmp/commonTranslatedStringKeysAndStrings/:simName?/:locale?', commonTranslatedStringKeysAndStrings );
rosettaApiServer.get( '/tmp/simSpecificTranslatedStringKeysAndStrings/:simName?/:locale?', simSpecificTranslatedStringKeysAndStrings );

// posts
rosettaApiServer.post( '/*', ( req, res, next ) => {
  logger.info( `post request received for ${req.url}` );
  next();
} );
rosettaApiServer.post( '/saveTranslation', saveTranslation );
rosettaApiServer.post( '/submitTranslation', submitTranslation );
rosettaApiServer.post( '/testTranslation', testTranslation );

export default rosettaApiServer;