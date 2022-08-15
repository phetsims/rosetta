// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets a list of all sim names.
 *
 * @author Liam Mulhall
 */

import config from '../../common/config.js';
import getSimMetadata from './getSimMetadata.js';
import logger from './logger.js';

/**
 * Return a list of lowercase-kebab (repo-style) sim names (e.g. acid-base-solutions).
 *
 * @returns {Promise<String[]>} - list of lowercase-kebab (repo-style) sim names (e.g. acid-base-solutions)
 */
const getSimNames = async () => {
  console.time( 'getSimNames' );
  logger.info( 'getting sim names' );
  const simNames = [];
  try {
    const simMetadata = await getSimMetadata();
    for ( const project of simMetadata.projects ) {

      // slice html/ off the project name
      // e.g. turn html/acid-base-solutions into acid-base-solutions
      const simName = project.name.slice( 5 );
      if ( config.ENVIRONMENT === 'development' ) {
        simNames.push( simName );
      }
      else if ( config.ENVIRONMENT === 'production' ) {
        if ( project.simulations.visible || project.simulations.isPrototype ) {
          simNames.push( simName );
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'got sim names; returning them' );
  console.timeEnd( 'getSimNames' );
  return simNames;
};

export default getSimNames;