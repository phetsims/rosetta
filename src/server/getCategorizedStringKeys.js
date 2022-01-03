// Copyright 2021, University of Colorado Boulder

/**
 * Export an object where string keys are organized into two categories: (1) common and (2) sim-specific.
 *
 * @author Liam Mulhall
 */

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import logger from './logger.js';

/**
 *
 *
 * @param {String} simName - sim name
 * @param {string[]} simNames - list of all sim names
 * @param {string[]} stringKeysWithRepoName - string keys with their respective repo names for the specified sim
 * @returns {Promise<{simSpecific: *[], common: *[]}>}
 */
const getCategorizedStringKeys = async ( simName, simNames, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s categorized string keys` );
  const categorizedStringKeys = {
    common: [],
    simSpecific: []
  };
  try {
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {

      // get the string key from the string key with repo name
      // e.g. get fooStringKey from fooStringKey/BAR_REPO
      const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );

      // get the repo name from the string key with repo name
      // e.g. get bar-repo from fooStringKey/BAR_REPO
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
      if ( stringKey.includes( 'a11y' ) ) {
        logger.verbose( 'not categorizing a11y string key' );
      }
      else {
        if ( simNames.includes( repoName ) ) {
          logger.verbose( `categorizing sim-specific string key: ${stringKeyWithRepoName}` );
          categorizedStringKeys.simSpecific.push( stringKey );
        }
        else {
          logger.verbose( `categorizing common string key: ${stringKeyWithRepoName}` );
          categorizedStringKeys.common.push( stringKey );
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s categorized string keys; returning them` );
  return categorizedStringKeys;
};

export default getCategorizedStringKeys;