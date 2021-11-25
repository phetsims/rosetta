// Copyright 2021, University of Colorado Boulder

import getLocaleInfo from '../src/server/getLocaleInfo.js';

QUnit.module( 'localeInfo' );

QUnit.skip( 'getLocaleInfo should return truthy', async assert => {
  const localeInfo = await getLocaleInfo();
  assert.ok( localeInfo );
} );