// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that transforms a translation into the format that expected for long-term storage string files.
 *
 * @author Liam Mulhall
 */

import logger from './logger.js';

/**
 * Return the translation with an added dummy field. (This function is obviously unfinished.)
 *
 * @param {Object} translation - translation received from client
 * @returns {Object} - translated with an added dummy field
 */
const prepareTranslationForLongTermStorage = translation => {
  logger.info( `adding dummy field to ${translation.locale}/${translation.sim}` );
  translation.dummyField = 'dummy';
  logger.info( `added dummy field to ${translation.locale}/${translation.sim}; returning translation` );
  return translation;
};

export default prepareTranslationForLongTermStorage;