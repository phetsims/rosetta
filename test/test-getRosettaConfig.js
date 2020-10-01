const getRosettaConfig = require( '../js/getRosettaConfig.js' );

QUnit.module( 'getRosettaConfig' );

QUnit.test( 'test what getRosettaConfig returns', assert => {
  const config = getRosettaConfig();
  assert.equal( typeof config, 'object', 'getRosettaConfig should return an object' );
} );