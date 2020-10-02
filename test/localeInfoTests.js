// Copyright 2020, University of Colorado Boulder

/**
 * This file tests the locally-run functions in localeInfo.js.
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// Modules
const localeInfo = require( '../js/localeInfo' );

QUnit.module( 'localeInfo' );

QUnit.test( 'test what getLocaleInfoObject returns', assert => {
  const localeInfoObject = localeInfo.getLocaleInfoObject();
  assert.equal( typeof localeInfoObject, 'object', 'getLocaleInfoObject should return an object' );
} );

QUnit.test( 'test what getSortedLocaleInfoArray returns', assert => {
  const sortedLocaleInfoArray = localeInfo.getSortedLocaleInfoArray();
  assert.equal( typeof sortedLocaleInfoArray, 'object', 'getSortedLocaleInfoArray should return an object' );
} );