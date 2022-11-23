// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an object containing sim-specific English string keys and their values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

// import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
// import getLatestSimSha from '../getLatestSimSha.js';
// import getSimHtml from '../getSimHtml.js';
// import getSimMetadata from '../getSimMetadata.js';
// import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
// import getSimUrl from '../getSimUrl.js';
// import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';

import logger from '../logger.js';
import getEnglishStringKeysAndValues from './getEnglishStringKeysAndValues.js';

/**
 * Return an object containing sim-specific English string keys and their values.
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

      // If the english string key has a value...
      if ( englishStringKeys.includes( stringKey ) ) {

        // Map the string key to its english value.
        stringKeysToSimSpecificEnglishStrings[ stringKey ] = englishStringKeysAndStrings[ stringKey ];
      }
      else {

        // We don't display unused string keys and strings to the user.
        // They get stripped out prior to sending them to the client.
        stringKeysToSimSpecificEnglishStrings[ stringKey ] = 'no longer used';
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s sim-specific english string keys and values; returning them` );

  return stringKeysToSimSpecificEnglishStrings;
};

// ( async () => {
//   const simUrl = getSimUrl( 'acid-base-solutions' );
//   const simHtml = await getSimHtml( simUrl );
//   const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
//   const simName = 'acid-base-solutions';
//   const cat = await getCategorizedStringKeys( simName, Object.keys( getSimNamesAndTitles( await getSimMetadata() ) ), Object.keys( stringKeysWithRepoName ) );
//   const sha = await getLatestSimSha( simName );
//   const res = await getSimSpecificEnglishStringKeysAndValues( 'acid-base-solutions', sha, cat, stringKeysWithRepoName );
//   console.log( JSON.stringify( res, null, 4 ) );
// } )();

export default getSimSpecificEnglishStringKeysAndValues;