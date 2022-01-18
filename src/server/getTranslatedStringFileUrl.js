// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets a translated sim's string file URL. As of this writing, a translated sim's string file
 * lives in the phetsims/babel repo.
 *
 * @author Liam Mulhall
 */

import config from './config.js';
import logger from './logger.js';

/**
 * Return the URL for a translated sim's string file.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @returns {String} - translated sim's string file URL
 */
const getTranslatedStringFile = ( simName, locale ) => {
  logger.verbose( `getting ${simName}/${locale}'s translated string file url` );
  logger.verbose( `got ${simName}/${locale}'s translated string file url; returning it` );
  return `${config.GITHUB_URL}/babel/${config.BABEL_BRANCH}/${simName}/${simName}-strings_${locale}.json`;
};

export default getTranslatedStringFile;