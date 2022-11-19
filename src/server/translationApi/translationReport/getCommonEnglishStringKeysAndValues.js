// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an array of arrays. Each sub-array has two elements: (1) a common English string key,
 * and (2) the string corresponding to (1).
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import getCommonRepos from '../getCommonRepos.js';
import getStringFileUrl from '../getStringFileUrl.js';
import logger from '../logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a common English string key followed by its value
 * (its string). This is implemented as an array of arrays where each sub-array has two elements, namely the common
 * English string key and its string.
 *
 * @param {String} simName - sim name
 * @param {String[]} simNames - list of all sim names
 * @param {{simSpecific: String[], common: String[]}} categorizedStringKeys - string keys categorized into common and sim-specific
 * @param {String[]} stringKeysWithRepoName - string keys with their respective repo names for the specified sim
 * @returns {Promise<String[][]>} - list of ordered pairs of common English string keys and strings
 */
const getCommonEnglishStringKeysAndValues = async ( simName, simNames, categorizedStringKeys, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s common english string keys and values` );
  const stringKeysToCommonEnglishStrings = new Map();
  try {

    // for each common repo, get the string file
    const commonRepos = await getCommonRepos( simName, simNames, stringKeysWithRepoName );
    const stringFiles = [];
    for ( const repo of commonRepos ) {
      const stringFileUrl = getStringFileUrl( repo );
      const stringFileRes = await axios.get( stringFileUrl );
      stringFiles.push( stringFileRes.data );
    }

    // for each common string key, find its value in one of the string files
    const commonStringKeys = categorizedStringKeys.common;
    for ( const stringKey of commonStringKeys ) {

      // we think of this loop as mapping string keys to their values
      let stringKeyMapped = false;
      for ( const stringFile of stringFiles ) {

        // find the key in the file that matches the string key we're interested in
        const matchingKey = Object.keys( stringFile ).find( key => key === stringKey );
        if ( stringFile[ matchingKey ] ) {
          stringKeysToCommonEnglishStrings.set( stringKey, stringFile[ matchingKey ].value );
          stringKeyMapped = true;
        }
      }

      // it's possible that the string key won't get mapped to a value
      // this can happen if a key-value pair is no longer used
      if ( !stringKeyMapped ) {

        // we don't display unused string keys and strings to the user
        // they get stripped out prior to sending them to the client
        stringKeysToCommonEnglishStrings.set( stringKey, 'no longer used' );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s common english string keys and values; returning them` );


  // use spread operator and brackets to return an array
  return [ ...stringKeysToCommonEnglishStrings ];
};

export default getCommonEnglishStringKeysAndValues;