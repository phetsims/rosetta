// Copyright 2015, University of Colorado Boulder

/**
 * A module that provides information and utilities related to language locales.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

/* jslint node: true */

var localeInfo = require( '../../chipper/js/data/localeInfo.js' );

// get locales into a sorted array
var sortedLocaleInfoArray = [];

for ( var locale in localeInfo ) {
  if ( locale !== 'en' ) {
    sortedLocaleInfoArray.push( {
      code: locale,
      name: localeInfo[ locale ].name,
      localizedName: localeInfo[ locale ].localizedName,
      direction: localeInfo[ locale ].direction
    } );
  }
}

sortedLocaleInfoArray.sort( function( a, b ) {
  'use strict';

  if ( a.name > b.name ) {
    return 1;
  }
  if ( a.name < b.name ) {
    return -1;
  }
  return 0;
} );

module.exports = {

  /**
   * localeInfo object from chipper's localeInfo.js
   */
  localeInfoObject: localeInfo,

  /**
   * localeInfo object from chipper's localeInfo.js, converted to an array sorted by locale name
   */
  sortedLocaleInfoArray: sortedLocaleInfoArray,

  /**
   * Obtain a string that describes the language associated with the provided locale.  For example, if the caller
   * specified 'es_MX', the string 'Spanish - Mexico' would be returned.
   * @param {string} locale
   * @returns {string}
   */
  localeToLanguageString: function( locale ) {
    'use strict';
    return localeInfo[ locale ].name;
  }
};
