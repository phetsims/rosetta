// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an object containing sim-specific translated string keys and values.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import getTranslatedStringFileUrl from '../getTranslatedStringFileUrl.js';
import logger from '../logger.js';

// import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
// import getSimHtml from '../getSimHtml.js';
// import getSimMetadata from '../getSimMetadata.js';
// import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
// import getSimUrl from '../getSimUrl.js';
// import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';

/**
 * Return an object containing sim-specific translated string keys and values.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<Object>} - sim-specific translated string keys and their values (their strings)
 */
const getSimSpecificTranslatedStringKeysAndValues = async (
  simName,
  locale,
  categorizedStringKeys
) => {
  logger.info( `getting ${simName}'s sim-specific translated string keys and values` );
  const simSpecificTranslatedStringKeysAndStrings = {};
  try {
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const translatedStringFileUrl = getTranslatedStringFileUrl( simName, locale );
    try {
      const stringKeysAndTranslatedValuesRes = await axios.get( translatedStringFileUrl );
      const stringKeysAndTranslatedValues = stringKeysAndTranslatedValuesRes.data;
      const translatedStringKeys = Object.keys( stringKeysAndTranslatedValues );
      // eslint-disable-next-line no-debugger
      debugger;

      // For each sim specific string key...
      for ( const stringKey of simSpecificStringKeys ) {

        // If the translated string key has a value...
        if ( translatedStringKeys.includes( stringKey ) ) {

          // Map the string key to its translated value.
          simSpecificTranslatedStringKeysAndStrings[ stringKey ] = stringKeysAndTranslatedValues[ stringKey ].value;
        }
        else {

          // TODO: Is this correct, given our new empty string policy?
          // Map the string key to an empty string.
          simSpecificTranslatedStringKeysAndStrings[ stringKey ] = '';
        }
      }
    }
    catch( e ) {
      if ( e.response.status === 404 ) {
        logger.verbose( 'translated string file doesn\'t exist; setting empty strings' );

        // Set every string key's value to an empty string.
        for ( const stringKey of simSpecificStringKeys ) {
          simSpecificTranslatedStringKeysAndStrings[ stringKey ] = '';
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
  logger.info( `got ${simName}'s sim-specific translated string keys and values; returning them` );

  return simSpecificTranslatedStringKeysAndStrings;
};

// ( async () => {
//   const simName = 'acid-base-solutions';
//   const locale = 'ab';
//   const simMetadata = await getSimMetadata();
//   const simNames = Object.keys( await getSimNamesAndTitles( simMetadata ) );
//   const simUrl = getSimUrl( simName );
//   const simHtml = await getSimHtml( simUrl );
//   const stringKeysWithRepoName = Object.keys( getStringKeysWithRepoName( simHtml ) );
//   const categorizedStringKeys = await getCategorizedStringKeys( simName, simNames, stringKeysWithRepoName );
//   const simSpecificTranslatedStringKeysAndValues = await getSimSpecificTranslatedStringKeysAndValues(
//     simName,
//     locale,
//     categorizedStringKeys
//   );
//   console.log( JSON.stringify( simSpecificTranslatedStringKeysAndValues, null, 4 ) );
// } )();

export default getSimSpecificTranslatedStringKeysAndValues;