// Copyright 2022, University of Colorado Boulder

import commonEnglishStringKeysAndStrings from './api/tmp/commonEnglishStringKeysAndStrings.js';
import commonTranslatedStringKeysAndStrings from './api/tmp/commonTranslatedStringKeysAndStrings.js';
import express from 'express';
import localeInfo from './api/localeInfo.js';
import saveTranslation from './api/saveTranslation.js';
import simNames from './api/simNames.js';
import simSpecificEnglishStringKeysAndStrings from './api/tmp/simSpecificEnglishStringKeysAndStrings.js';
import simSpecificTranslatedStringKeysAndStrings from './api/tmp/simSpecificTranslatedStringKeysAndStrings.js';
import submitTranslation from './api/submitTranslation.js';
import testTranslation from './testTranslation.js';
import translationFormData from './api/translationFormData.js';
import sha from './api/sha.js';

const rosettaApiServer = express();

rosettaApiServer.get( '/', ( req, res ) => {
  res.send( 'Hello API!' );
} );

// gets
rosettaApiServer.get( '/localeInfo', localeInfo );
rosettaApiServer.get( '/simNames', simNames );
rosettaApiServer.get( '/translationFormData/:simName?/:locale?', translationFormData );
rosettaApiServer.get( '/sha', sha );

// These might be used in the translation report. (Currently unused, hence the tmp directory.)
rosettaApiServer.get( '/tmp/commonEnglishStringKeysAndStrings/:simName?', commonEnglishStringKeysAndStrings );
rosettaApiServer.get( '/tmp/simSpecificEnglishStringKeysAndStrings/:simName?', simSpecificEnglishStringKeysAndStrings );
rosettaApiServer.get( '/tmp/commonTranslatedStringKeysAndStrings/:simName?/:locale?', commonTranslatedStringKeysAndStrings );
rosettaApiServer.get( '/tmp/simSpecificTranslatedStringKeysAndStrings/:simName?/:locale?', simSpecificTranslatedStringKeysAndStrings );

// posts
rosettaApiServer.post( '/saveTranslation', saveTranslation );
rosettaApiServer.post( '/submitTranslation', submitTranslation );
rosettaApiServer.post( '/testTranslation', testTranslation );

export default rosettaApiServer;