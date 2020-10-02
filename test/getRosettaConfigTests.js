// Copyright 2020, University of Colorado Boulder

/**
 * This file tests the locally-run functions in getRosettaConfig.js.
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// Modules
const getRosettaConfig = require( '../js/getRosettaConfig' );

QUnit.module( 'getRosettaConfig' );

QUnit.test( 'test what getRosettaConfig returns', assert => {
  const config = getRosettaConfig();
  assert.equal( typeof config, 'object', 'getRosettaConfig should return an object' );
} );