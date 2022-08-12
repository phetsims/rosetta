// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an array of arrays. Each sub-array has two elements: (1) a sim-specific translated
 * string key, and (2) the string corresponding to (1).
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getTranslatedStringFileUrl from '../getTranslatedStringFileUrl.js';
import logger from '../logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a sim-specific string key followed by its value (its
 * string). This is implemented as an array of arrays where each sub-array has two elements, namely the sim-specific
 * translated string key and its string.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<String[][]>} - ordered pairs of sim-specific translated string keys and their values (their strings)
 */
const getSimSpecificTranslatedStringKeysAndStrings = async ( simName, locale, categorizedStringKeys ) => {
  console.time( 'getSimSpecificTranslatedStringKeysAndStrings' );
  logger.info( `getting ${simName}'s sim-specific translated string keys and strings` );
  const simSpecificTranslatedStringKeysAndStrings = new Map();
  try {
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const translatedStringFileUrl = getTranslatedStringFileUrl( simName, locale );
    try {
      const stringKeysAndTranslatedValuesRes = await axios.get( translatedStringFileUrl );
      const stringKeysAndTranslatedValues = stringKeysAndTranslatedValuesRes.data;
      const translatedStringKeys = Object.keys( stringKeysAndTranslatedValues );

      // for each sim specific string key...
      for ( const stringKey of simSpecificStringKeys ) {

        // if the translated string key has a value...
        if ( translatedStringKeys.includes( stringKey ) ) {

          // map the string key to its translated value
          simSpecificTranslatedStringKeysAndStrings.set( stringKey, stringKeysAndTranslatedValues[ stringKey ].value );
        }
        else {

          // map the string key to an empty string
          simSpecificTranslatedStringKeysAndStrings.set( stringKey, '' );
        }
      }
    }
    catch( e ) {
      if ( e.response.status === 404 ) {
        logger.verbose( 'translated string file doesn\'t exist; setting empty strings' );

        // set every string key's value to an empty string
        for ( const stringKey of simSpecificStringKeys ) {
          simSpecificTranslatedStringKeysAndStrings.set( stringKey, '' );
        }
      }
      else {
        logger.error( e );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s sim-specific translated string keys and strings; returning them` );

  console.timeEnd( 'getSimSpecificTranslatedStringKeysAndStrings' );

  // use spread operator and brackets to return an array
  return [ ...simSpecificTranslatedStringKeysAndStrings ];
};

export default getSimSpecificTranslatedStringKeysAndStrings;