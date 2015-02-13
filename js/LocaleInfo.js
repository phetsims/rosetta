// Copyright 2002-2015, University of Colorado Boulder

/**
 * A module that provides information and utilities related to language locales.
 *
 * @author John Blanco
 */
'use strict'; // TODO: Does this work, and is it needed?

// locale-to-language strings TODO: This is incomplete.
var localeInfo = {
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  es_MX: 'Spanish - Mexico',
  zh_CN: 'Chinese - China',
  zh_TW: 'Chinese - Taiwan'
};

/**
 * Obtain a string that describes the language associated with the provided locale.  For example, if the caller
 * specified 'es_MX', the string 'Spanish - Mexico' would be returned.
 * @param {String} locale
 * @returns {String}
 */
module.exports.localeToLanguageString = function( locale ) {
  return localeInfo[ locale ];
};
