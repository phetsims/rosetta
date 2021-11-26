// Copyright 2021, University of Colorado Boulder

import config from '../src/server/config.js';

// import getSimNames from '../src/server/getSimNames.js';
import getTranslationFormData from '../src/server/getTranslationFormData.js';
import logger from '../src/server/logger.js';
import getRandomLocales from './utils/getRandomLocales.js';
import getRandomSimNames from './utils/getRandomSimNames.js';

QUnit.module( 'translationFormData' );

QUnit.test( 'translationFormData should return truthy', async assert => {

  if ( config.ENVIRONMENT === 'development' ) {
    const numberOfSimsToTest = 1;
    const randomSimNames = await getRandomSimNames( numberOfSimsToTest );
    const randomLocales = await getRandomLocales( numberOfSimsToTest );
    for ( let i = 0; i < numberOfSimsToTest; i++ ) {
      const translationFormData = await getTranslationFormData( randomSimNames[ i ], randomLocales[ i ] );
      assert.ok( translationFormData );
    }
  }
  else if ( config.ENVIRONMENT === 'production' ) {
    logger.info( 'hello' );
  }
  else {
    logger.error( 'you need to specify either development or production for your config environment variable' );
  }
} );