// Copyright 2002-2015, University of Colorado Boulder

/**
 * A module that provides information and utilities related to language locales.
 *
 * @author John Blanco
 */

/* jslint node: true */
'use strict';


var localeInfo = require( '../../chipper/js/data/localeInfo.js' );


module.exports.localeInfoArray = function() {
  return localeInfo;
};


/**
 * Obtain a string that describes the language associated with the provided locale.  For example, if the caller
 * specified 'es_MX', the string 'Spanish - Mexico' would be returned.
 * @param {String} locale
 * @returns {String}
 */
module.exports.localeToLanguageString = function( locale ) {
  return localeInfo[ locale ].name;
};
