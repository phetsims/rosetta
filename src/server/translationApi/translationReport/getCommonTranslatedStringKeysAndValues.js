// Copyright 2022, University of Colorado Boulder

/**
 * Export an object that returns an object containing common translated string keys and their values.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from '../getCommonRepos.js';
import getRepoNameToStringKeys from '../getRepoNameToStringKeys.js';
import getTranslatedStringFileUrl from '../getTranslatedStringFileUrl.js';
import logger from '../logger.js';

// import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
// import getSimHtml from '../getSimHtml.js';
// import getSimMetadata from '../getSimMetadata.js';
// import getSimUrl from '../getSimUrl.js';
// import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';
// import getCategorizedStringKeys from '../getCategorizedStringKeys.js';

/**
 * Return an object containing common translated string keys and their values.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @param {String[]} simNames - list of all sim names
 * @param {String[]} stringKeysWithRepoName - stringKey/REPO_NAME we get from a sim's HTML
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @returns {Promise<Object>} - ordered pairs of common translated string keys and their values (their strings)
 */
const getCommonTranslatedStringKeysAndValues = async (
  simName,
  locale,
  simNames,
  stringKeysWithRepoName,
  categorizedStringKeys
) => {

  const commonTranslatedStringKeysAndStrings = {};
  const commonStringKeys = categorizedStringKeys.common;

  // Get a list of common repos for the sim.
  const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );

  /*
   * We want a data structure that looks like:
   *
   * {
   *   repoName1: [stringKeyA, stringKeyB, stringKeyC]
   *   repoName2: [stringKeyD, stringKeyE, stringKeyF]
   *   repoName3: [stringKeyG, stringKeyH, stringKeyI]
   *   ...
   *   repoNameN: [stringKeyX, stringKeyY, stringKeyZ]
   * }
   *
   * For each repo, we will get its string file. Then we will get the value for each string key in the list of string
   * keys for that repo.
   */

  // Create the above data structure.
  const repoNameToStringKeys = getRepoNameToStringKeys( stringKeysWithRepoName, commonRepos, commonStringKeys );

  // For each common repo from which the sim gets string keys...
  for ( const repo in repoNameToStringKeys ) {

    // Get the string file URL.
    const translatedStringFileUrl = getTranslatedStringFileUrl( repo, locale );

    // Try to get the contents stored at the string file URL.
    try {
      const translatedStringKeysAndStringsRes = await axios.get( translatedStringFileUrl );
      const translatedStringKeysAndValues = translatedStringKeysAndStringsRes.data;

      // For each string key associated with the repo, extract its value from the string file.
      for ( const stringKey of repoNameToStringKeys[ repo ] ) {
        if ( translatedStringKeysAndValues[ stringKey ] ) {
          console.log( 'here' );
          commonTranslatedStringKeysAndStrings[ stringKey ] = translatedStringKeysAndValues[ stringKey ].value;
        }
        else {
          console.log( 'there' );
          commonTranslatedStringKeysAndStrings[ stringKey ] = '';
        }
      }
    }
    catch( e ) {

      // If there is no string file, then there hasn't been a translation that affects the repo.
      if ( e.response.status === 404 ) {
        logger.verbose( `translated string file doesn't exist; setting empty strings for ${repo}` );
        for ( const stringKey of repoNameToStringKeys[ repo ] ) {
          commonTranslatedStringKeysAndStrings[ stringKey ] = '';
        }
      }
      else {
        logger.error( e );
      }
    }
  }

  return commonTranslatedStringKeysAndStrings;
};

// ( async () => {
//   const simName = 'acid-base-solutions';
//   const locale = 'de';
//   const simMetadata = await getSimMetadata();
//   const simNames = Object.keys( await getSimNamesAndTitles( simMetadata ) );
//   const simUrl = getSimUrl( simName );
//   const simHtml = await getSimHtml( simUrl );
//   const stringKeysWithRepoName = Object.keys( getStringKeysWithRepoName( simHtml ) );
//   const categorizedStringKeys = await getCategorizedStringKeys( simName, simNames, stringKeysWithRepoName );
//   const res = await getCommonTranslatedStringKeysAndValues(
//     simName,
//     locale,
//     simNames,
//     stringKeysWithRepoName,
//     categorizedStringKeys
//   );
//   console.log( JSON.stringify( res, null, 4 ) );
// } )();

export default getCommonTranslatedStringKeysAndValues;