// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that returns an array of common repos for a sim.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getRepoNameFromStringKeyWithRepoName from './getRepoNameFromStringKeyWithRepoName.js';
import logger from './logger.js';

/**
 * Return an array of lowercase-kebab names of common repos for a given sim. (Common repos are repos that multiple
 * sims use. For example, phetsims/scenery is a common repo.) These repos are sorted alphabetically.
 *
 * @param {String} simName - sim name
 * @param {String[]} simNames - list of all sim names
 * @param {String[]} stringKeysWithRepoName - string keys with their respective repo names for the specified sim
 * @returns {Promise<String[]>} - list of common repos for a sim
 */
const getCommonRepos = async ( simName, simNames, stringKeysWithRepoName ) => {
  logger.info( `getting ${simName}'s common repos` );
  const commonRepos = new Set();
  try {
    for ( const stringKeyWithRepoName of stringKeysWithRepoName ) {
      const repoName = getRepoNameFromStringKeyWithRepoName( stringKeyWithRepoName );
      if ( ( simNames ).includes( repoName ) ) {
        logger.verbose( `${repoName} is in sim names; it's not a common repo` );
      }
      else {
        commonRepos.add( repoName );
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `got ${simName}'s common repos; returning them sorted alphabetically` );
  return Array.from( commonRepos ).sort();
};

export default getCommonRepos;