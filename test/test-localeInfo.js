const localeInfo = require( '../js/localeInfo.js' );

QUnit.module( 'localeInfo' );

QUnit.test( 'test what getLocaleInfoObject returns', assert => {
  const localeInfoObject = localeInfo.getLocaleInfoObject();
  assert.equal( typeof localeInfoObject, 'object', 'getLocaleInfoObject should return an object' );
} );