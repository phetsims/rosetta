// Copyright 2023, University of Colorado Boulder

import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';
import axios from 'axios';

/**
 * Get a translation file for a given repo and locale if it exists or
 * return an empty object if the translation file doesn't exist.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Return the contents of the translation file if it exists.
 *
 * @param {String} repo - GitHub repository where translation file lives
 * @param {String} locale - ISO 639-1 locale code, e.g. es for Spanish
 * @returns {Promise<Object|null>}
 */
const getTranslatedStringFile = async ( repo, locale ) => {

  let oldTranslationFile = {};

  // Get old translation file if one exists.
  const oldTranslationFileUrl = getTranslatedStringFileUrl( repo, locale );
  try {
    const oldTranslationFileRes = await axios.get( oldTranslationFileUrl );
    if ( oldTranslationFileRes.status !== 404 ) {
      oldTranslationFile = oldTranslationFileRes.data;
    }
  }
  catch( e ) {
    if ( Number( e.response.status ) === 404 ) {
      logger.warn( `no translation file for ${locale}/${repo}` );
    }
    else {
      logger.error( e );
    }
  }
  return oldTranslationFile;
};

export default getTranslatedStringFile;