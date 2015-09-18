// Copyright 2002-2015, University of Colorado Boulder

/**
 * A module that provides information and utilities related to language locales.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

/* jslint node: true */
'use strict';

var localeInfo = require( '../../chipper/js/data/localeInfo.js' );

// get locales into a sorted array
var sortedLocales = [];

for ( var locale in localeInfo ) {
  if ( locale !== 'en' ) {
    sortedLocales.push( {
      code: locale,
      name: localeInfo[ locale ].name,
      localizedName: localeInfo[ locale ].localizedName,
      direction: localeInfo[ locale ].direction
    } );
  }
}

sortedLocales.sort( function( a, b ) {
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
   * Return the localeInfo array from chipper's localeInfo.js
   */
  localeInfoArray: function() {
    return localeInfo;
  },

  /**
   * Return the localeInfo array from chipper's localeInfo.js sorted by locale name
   */
  sortedLocaleInfoArray: function() {
    return sortedLocales;
  },

  /**
   * Obtain a string that describes the language associated with the provided locale.  For example, if the caller
   * specified 'es_MX', the string 'Spanish - Mexico' would be returned.
   * @param {String} locale
   * @returns {String}
   */
  localeToLanguageString: function( locale ) {
    return localeInfo[ locale ].name;
  }
};
