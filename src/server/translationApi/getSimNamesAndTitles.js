// Copyright 2022, University of Colorado Boulder

/**
 * This file exports a function that gets an object containing string lowercase kebab case sim names
 * (e.g. acid-base-solutions) mapped to sim titles (e.g. Acid-Base Solutions).
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from './logger.js';

/**
 * If the sim should be visible, extract its name from the simulations object provided, otherwise return false.
 *
 * TODO: Cast isTeamMember to a boolean. See https://github.com/phetsims/rosetta/issues/391.
 *
 * @param {Object} sim - simulations object from sim metadata
 * @param {String} isTeamMember - whether a translator is a team member
 * @returns {Boolean|String} - false if sim shouldn't be visible, sim name otherwise
 */
const extractSimName = ( sim, isTeamMember ) => {
  let simName = false;
  if ( isTeamMember === 'true' || ( sim.visible || sim.isPrototype ) ) {
    simName = sim.name;
  }
  return simName;
};

/**
 * Return an object containing string lowercase kebab case sim names (e.g. acid-base-solutions) mapped to sim
 * titles (e.g. Acid-Base Solutions).
 *
 * TODO: Cast isTeamMember to a boolean. See https://github.com/phetsims/rosetta/issues/391.
 *
 * @param {Object} simMetadata - sim metadata obtained from the PhET website
 * @param {String} isTeamMember - whether a translator is a team member
 * @returns {Object} - sim names mapped to sim titles
 */
const getSimNamesAndTitles = ( simMetadata, isTeamMember ) => {
  logger.info( 'getting sim names and titles' );
  const simNamesAndTitles = {};
  try {
    for ( const project of simMetadata.projects ) {
      for ( const sim of project.simulations ) {
        const simTitle = sim.localizedSimulations.en.title;
        const simName = extractSimName( sim, isTeamMember );
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