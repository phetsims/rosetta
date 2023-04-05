// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an object containing sim-specific English string keys and their values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { NO_LONGER_USED_FLAG } from '../../../common/constants.js';
import logger from '../logger.js';
import getEnglishStringKeysAndValues from './getEnglishStringKeysAndValues.js';

/**
 * Return an object containing sim-specific English string keys and their values.
 *
 * NOTE:
 * Getting sim-specific English string keys and strings is done with SHA whereas the others are done by getting data
 * from the master branch.
 *
 * @param {String} simName - sim name
 * @param {String} sha - SHA for the sim
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @param {String[]} stringKeysWithRepoName - list of REPO_NAME/stringKey extracted from sim HTML
 * @returns {Promise<Object>} - sim-specific English string keys and their values (their strings)
 */
const getSimSpecificEnglishStringKeysAndValues = async ( simName, sha, categorizedStringKeys, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s sim-specific english string keys and values` );
  const stringKeysToSimSpecificEnglishStrings = {};
  try {
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const englishStringKeysAndStrings = await getEnglishStringKeysAndValues( simName, stringKeysWithRepoName, sha );
    const englishStringKeys = Object.keys( englishStringKeysAndStrings );

    // For each sim-specific string key...
    for ( const stringKey of simSpecificStringKeys ) {

      // If the English string key has a value...
      if ( englishStringKeys.includes( stringKey ) ) {

        // Map the string key to its English value.
        stringKeysToSimSpecificEnglishStrings[ stringKey ] = englishStringKeysAndStrings[ stringKey ];
      }
      else {

        // We don't display unused string keys and strings to the user.
        // They get stripped out prior to sending them to the client.
        stringKeysToSimSpecificEnglishStrings[ stringKey ] = NO_LONGER_USED_FLAG;
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s sim-specific english string keys and values; returning them` );

  return stringKeysToSimSpecificEnglishStrings;
};

export default getSimSpecificEnglishStringKeysAndValues;