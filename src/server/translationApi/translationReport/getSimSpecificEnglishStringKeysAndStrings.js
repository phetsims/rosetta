// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an array of arrays. Each sub-array has two elements: (1) a sim-specific English
 * string key, and (2) the string corresponding to (1).
 *
 * @author Liam Mulhall
 */

// import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
// import getSimHtml from '../getSimHtml.js';
// import getSimMetadata from '../getSimMetadata.js';
// import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
// import getSimUrl from '../getSimUrl.js';
// import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';

import logger from '../logger.js';
import getEnglishStringKeysAndValues from './getEnglishStringKeysAndValues.js';

/**
 * Return a list of ordered pairs where each ordered pair is a sim-specific string key followed by its value (its
 * string). This is implemented as an array of arrays where each sub-array has two elements, namely the sim-specific
 * English string key and its string.
 *
 * @param {String} simName - sim name
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @param {String[]} stringKeysWithRepoName - list of REPO_NAME/stringKey extracted from sim HTML
 * @returns {Promise<String[][]>} - ordered pairs of sim-specific English string keys and their values (their strings)
 */
const getSimSpecificEnglishStringKeysAndStrings = async ( simName, categorizedStringKeys, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s sim-specific english string keys and strings` );
  const stringKeysToSimSpecificEnglishStrings = new Map();
  try {
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const englishStringKeysAndStrings = await getEnglishStringKeysAndValues( simName, stringKeysWithRepoName );
    const englishStringKeys = Object.keys( englishStringKeysAndStrings );

    // for each sim-specific string key...
    for ( const stringKey of simSpecificStringKeys ) {

      // if the english string key has a value...
      if ( englishStringKeys.includes( stringKey ) ) {

        // map the string key to its english value
        stringKeysToSimSpecificEnglishStrings.set( stringKey, englishStringKeysAndStrings[ stringKey ] );
      }
      else {

        // we don't display unused string keys and strings to the user
        // they get stripped out prior to sending them to the client
        stringKeysToSimSpecificEnglishStrings.set( stringKey, 'no longer used' );
      }
    }
  }
  catch( e ) {
    logger.error( `hello: ${e}` );
  }
  logger.info( `got ${simName}'s sim-specific english string keys and strings; returning them` );


  // use spread operator and brackets to return an array
  return [ ...stringKeysToSimSpecificEnglishStrings ];
};

// ( async () => {
//   const simUrl = getSimUrl( 'acid-base-solutions' );
//   const simHtml = await getSimHtml( simUrl );
//   const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
//   const simName = 'acid-base-solutions';
//   const cat = await getCategorizedStringKeys( simName, Object.keys( getSimNamesAndTitles( await getSimMetadata() ) ), Object.keys( stringKeysWithRepoName ) );
//   const res = await getSimSpecificEnglishStringKeysAndStrings( 'acid-base-solutions', cat, stringKeysWithRepoName );
//   console.log( JSON.stringify( res, null, 4 ) );
// } )();

export default getSimSpecificEnglishStringKeysAndStrings;