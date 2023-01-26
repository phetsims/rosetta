// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an object where string keys are organized into two categories: (1) common and (2)
 * sim-specific.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimMetadata from './getSimMetadata.js';
import getSimNamesAndTitles from './getSimNamesAndTitles.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import logger from './logger.js';

/**
 * Return an object with string keys categorized by whether they are common or sim-specific. Common string keys are
 * used by multiple sims whereas sim-specific string keys are only used by one sim. We categorized the string keys like
 * this so that we can separate them in the frontend translation form.
 *
 * @param {String} simName - sim name
 * @param {String[]} stringKeysWithRepoName - string keys with their respective repo names for the specified sim
 * @returns {Promise<Object>} - string keys categorized into common and sim-specific
 */
const getCategorizedStringKeys = async ( simName, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s categorized string keys` );

  const simMetadata = await getSimMetadata();
  const simNames = Object.keys( getSimNamesAndTitles( simMetadata, 'true' ) );

  const categorizedStringKeys = {
    common: [],
    simSpecific: [],
    shared: [],
    sharedSims: []
  };
  try {
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {

      // Get the string key from the string key with repo name.
      // E.g. get fooStringKey from fooStringKey/BAR_REPO.
      const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );

      // Get the repo name from the string key with repo name.
      // E.g. get bar-repo from fooStringKey/BAR_REPO.
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
      if ( stringKey.includes( 'a11y' ) ) {
        logger.verbose( 'not categorizing a11y string key' );
      }
      else {
        if ( repoName === simName ) {
          logger.verbose( `categorizing sim-specific string key: ${stringKeyWithRepoName}` );
          categorizedStringKeys.simSpecific.push( stringKey );
        }
        else if ( simNames.includes( repoName ) ) {
          logger.verbose( `categorizing shared string key: ${stringKeyWithRepoName}` );
          categorizedStringKeys.shared.push( stringKey );
          if ( !categorizedStringKeys.sharedSims.includes( repoName ) ) {
            categorizedStringKeys.sharedSims.push( repoName );
          }
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