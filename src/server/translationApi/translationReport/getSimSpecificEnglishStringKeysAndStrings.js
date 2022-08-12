// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an array of arrays. Each sub-array has two elements: (1) a sim-specific English
 * string key, and (2) the string corresponding to (1).
 *
 * @author Liam Mulhall
 */

import getEnglishStringKeysAndStrings from './getEnglishStringKeysAndStrings.js';
import logger from '../logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a sim-specific string key followed by its value (its
 * string). This is implemented as an array of arrays where each sub-array has two elements, namely the sim-specific
 * English string key and its string.
 *
 * @param {String} simName - sim name
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<String[][]>} - ordered pairs of sim-specific English string keys and their values (their strings)
 */
const getSimSpecificEnglishStringKeysAndStrings = async ( simName, categorizedStringKeys ) => {
  console.time( 'getSimSpecificEnglishStringKeysAndStrings' );
  logger.info( `getting ${simName}'s sim-specific english string keys and strings` );
  const stringKeysToSimSpecificEnglishStrings = new Map();
  try {
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const englishStringKeysAndStrings = await getEnglishStringKeysAndStrings( simName );
    const englishStringKeys = Object.keys( englishStringKeysAndStrings );

    // for each sim-specific string key...
    for ( const stringKey of simSpecificStringKeys ) {

      // if the english string key has a value...
      if ( englishStringKeys.includes( stringKey ) ) {

        // map the string key to its english value
        stringKeysToSimSpecificEnglishStrings.set( stringKey, englishStringKeysAndStrings[ stringKey ].value );
      }
      else {

        // we don't display unused string keys and strings to the user
        // they get stripped out prior to sending them to the client
        stringKeysToSimSpecificEnglishStrings.set( stringKey, 'no longer used' );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s sim-specific english string keys and strings; returning them` );

  console.timeEnd( 'getSimSpecificEnglishStringKeysAndStrings' );

  // use spread operator and brackets to return an array
  return [ ...stringKeysToSimSpecificEnglishStrings ];
};

export default getSimSpecificEnglishStringKeysAndStrings;