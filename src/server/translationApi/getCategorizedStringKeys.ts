// Copyright 2021-2022, University of Colorado Boulder

/**
 * Take a list of strings that represent string keys with their repo names, which is how they are generally formatted in
 * the english-string-map.json files, and categorize them into the categories needed by the front end to display the
 * strings in different sections.  Look elsewhere in the code to find more about these categories and how they are used.
 * An example of a string key with a repo name is "QUANTUM_MEASUREMENT/screen.blochSphere".
 *
 * @param simName - sim name
 * @param stringKeysWithRepoName - string keys with their respective repo names for the specified sim
 * @returns A promise that resolves to an object with categorized string keys
 *
 * @author Liam Mulhall
 * @author John Blanco (PhET Interactive Simulations)
 */

import privateConfig from '../../common/privateConfig.js';
import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import getSimMetadata from './getSimMetadata.js';
import getSimNamesAndTitles from './getSimNamesAndTitles.js';
import getStringKeyFromStringKeyWithRepoName from './getStringKeyFromStringKeyWithRepoName.js';
import logger from './logger.js';

export type CategorizedStringKeys = {
  common: string[];
  simSpecific: string[];
  shared: string[];
  sharedSims: string[];
};

const getCategorizedStringKeys = async ( simName: string,
                                         stringKeysWithRepoName: string[] ): Promise<CategorizedStringKeys> => {

  logger.info( `getting ${simName}'s categorized string keys` );

  const simMetadata = await getSimMetadata();
  const simNames = Object.keys( getSimNamesAndTitles( simMetadata, true ) );

  const categorizedStringKeys: CategorizedStringKeys = {
    common: [],
    simSpecific: [],
    shared: [],
    sharedSims: []
  };

  try {
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {

      // Get the string key from the string key with repo name.
      const stringKey = getStringKeyFromStringKeyWithRepoName( stringKeyWithRepoName );

      // Get the repo name from the string key with repo name.
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );

      // Only show a11y keys if the option is enabled. If it's disabled or even if it's not used, the fallback is not showing a11y keys.
      if ( !privateConfig.TRANSLATE_A11Y && stringKey.startsWith( 'a11y' ) ) {
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