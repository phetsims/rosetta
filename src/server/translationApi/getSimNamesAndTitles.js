// Copyright 2022, University of Colorado Boulder

/**
 * This file exports a function that gets an object containing string lowercase kebab case sim names
 * (e.g. acid-base-solutions) mapped to sim titles (e.g. Acid-Base Solutions).
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import config from '../../common/config.js';
import logger from './logger.js';

/**
 * If the sim should be visible, extract its name from the simulations object provided, otherwise return false.
 *
 * @param {object} sim - simulations object from sim metadata
 * @returns {boolean|string} - false if sim shouldn't be visible, sim name otherwise
 */
const extractSimName = sim => {
  let simName = false;
  const wantSimVisible = config.ENVIRONMENT === 'development' ||
                         ( config.ENVIRONMENT === 'production' &&
                           ( sim.visible || sim.isPrototype ) );
  if ( wantSimVisible ) {
    simName = sim.name;
  }
  return simName;
};

/**
 * Return an object containing string lowercase kebab case sim names (e.g. acid-base-solutions) mapped to sim
 * titles (e.g. Acid-Base Solutions).
 *
 * @param {object} simMetadata - sim metadata obtained from the PhET website
 * @returns {object} - sim names mapped to sim titles
 */
const getSimNamesAndTitles = simMetadata => {
  logger.info( 'getting sim names and titles' );
  const simNamesAndTitles = {};
  try {
    for ( const project of simMetadata.projects ) {
      for ( const sim of project.simulations ) {
        const simTitle = sim.localizedSimulations.en.title;
        const simName = extractSimName( sim );
        if ( simName ) {
          simNamesAndTitles[ simName ] = simTitle;
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
    simNamesAndTitles.error = 'unable to get sim names and titles';
  }
  logger.info( 'returning sim names and titles' );
  return simNamesAndTitles;
};

export default getSimNamesAndTitles;