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

  /*
   * We need to:
   * (1) package up the sim-specific stuff, and
   * (2) get all the common stuff.
   */

  // (1)
  // const simSpecific = translation.simSpecific;

  /*
   * Make a variable "preparedSimSpecificTranslation".
   * Get sim's translated file.
   * The sim's translated file contains the previous translation.
   * Thus, we don't need the oldTranslation field in translationFormData.
   * For each string key in the translation:
   *   - Check if there's a matching string key in the translated file.
   *     - If there is, proceed.
   *     - If there isn't...
   *       - What if the string file didn't exist?
   *       - What if the string key hasn't been translated? Will a string key exist?
   *   - Check if the translation's value matches the translated file's value.
   *     - If it does, there hasn't been a change.
   *     - If it doesn't there has been a change.
   *       - We need to add the old value to the history object.
   *         - Also the old user ID, timestamp, and old-old value.
   *       - We need to make the new value be the value.
   *       - If the string file or string key doesn't exist, we need to create all fields.
   */

  // (2)
  // const common = translation.common;

  return translation;
};

export default prepareTranslationForLongTermStorage;