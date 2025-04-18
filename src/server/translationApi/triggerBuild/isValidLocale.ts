// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that tells whether a locale is in the list of locales.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getLocaleInfo from '../getLocaleInfo.js';
import logger from '../logger.js';

/**
 * Tell whether a locale is in the list of locales.
 *
 * @param locale - ISO 639-1 locale code, e.g. es for Spanish
 * @returns - whether the locale is valid
 */
const isValidLocale = async ( locale: string ): Promise<boolean> => {
  logger.info( `checking if ${locale} is valid` );
  const localeInfo = await getLocaleInfo();
  const listOfLocales = Object.keys( localeInfo );
  let isValid = false;
  if ( listOfLocales.includes( locale ) ) {
    isValid = true;
  }
  logger.info( `${locale} is valid = ${isValid}` );
  return isValid;
};

export default isValidLocale;