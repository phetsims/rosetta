// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that tells whether a locale is in the list of locales.
 *
 * @author Liam Mulhall
 */

import getLocaleInfo from '../getLocaleInfo.js';

/**
 * Tell whether a locale is in the list of locales.
 *
 * @param {string} locale - ISO 639-1 locale code, e.g. es for Spanish
 * @return {boolean}
 */
const isValidLocale = locale => {
  const localeInfo = getLocaleInfo();
  const listOfLocales = Object.keys( localeInfo );
  let ret = false;
  if ( listOfLocales.includes( locale ) ) {
    ret = true;
  }
  return ret;
};

export default isValidLocale;