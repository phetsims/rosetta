// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an array of arrays. Each sub-array has two elements: (1) a common translated string
 * key, and (2) the string corresponding to (1).
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a common translated string key followed by its value
 * (its string). This is implemented as an array of arrays where each sub-array has two elements, namely the common
 * translated string key and its string.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @param {String[]} stringKeysWithRepoName - string keys with their respective repo names for the specified sim
 * @returns {Promise<String[][]>} - ordered pairs of common translated string keys and their values (their strings)
 */
const getCommonTranslatedStringKeysAndStrings = async ( simName, locale, categorizedStringKeys, stringKeysWithRepoName ) => {
  console.time( 'getCommonTranslatedStringKeysAndStrings' );
  logger.info( `getting ${simName}'s common translated string keys and strings` );
  const commonTranslatedStringKeysAndStrings = new Map();
  try {

    // map string keys in the sim to their respective repo names
    console.time( 'mapStringKeysToRepoNames' );
    const stringKeyToRepoName = new Map();
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
      const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
      stringKeyToRepoName.set( stringKey, repoName );
    }
    console.timeEnd( 'mapStringKeysToRepoNames' );

    // for each common string key in the sim...
    console.time( 'loopThroughCommonKeys' );
    const commonStringKeys = categorizedStringKeys.common;
    for ( const stringKey of commonStringKeys ) {

      // if the string key is in the map we made earlier...
      if ( stringKeyToRepoName.has( stringKey ) ) {

        // get the string key's repo url
        const repoName = stringKeyToRepoName.get( stringKey );                          // inefficient
        const translatedStringFileUrl = getTranslatedStringFileUrl( repoName, locale ); // inefficient

        // go into the string file for that repo and grab the string key's value
        try {
          const translatedStringKeysAndStringsRes = await axios.get( translatedStringFileUrl );
          const translatedStringKeysAndStrings = translatedStringKeysAndStringsRes.data;
          if ( translatedStringKeysAndStrings[ stringKey ] ) {
            commonTranslatedStringKeysAndStrings.set( stringKey, translatedStringKeysAndStrings[ stringKey ].value );
          }
          else {
            commonTranslatedStringKeysAndStrings.set( stringKey, '' );
          }
        }
        catch( e ) {
          if ( e.response.status === 404 ) {
            logger.verbose( `translated string file doesn't exist; setting empty string for ${stringKey}` );
            commonTranslatedStringKeysAndStrings.set( stringKey, '' );
          }
          else {
            logger.error( e );
          }
        }
      }
    }
    console.timeEnd( 'loopThroughCommonKeys' );
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s common translated string keys and strings; returning them` );

  console.timeEnd( 'getCommonTranslatedStringKeysAndStrings' );

  // use spread operator and brackets to return an array
  return [ ...commonTranslatedStringKeysAndStrings ];
};

export default getCommonTranslatedStringKeysAndStrings;