// Copyright 2021, University of Colorado Boulder

import getSimNames from '../src/server/getSimNames.js';

QUnit.module( 'simNames' );

QUnit.test( 'getSimNames should return truthy', async assert => {
  const simNames = await getSimNames();
  assert.ok( simNames );
} );