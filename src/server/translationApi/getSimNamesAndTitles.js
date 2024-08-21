// Copyright 2022, University of Colorado Boulder

/**
 * This file exports a function that gets an object containing string lowercase kebab case sim names
 * (e.g. acid-base-solutions) mapped to sim titles (e.g. Acid-Base Solutions).
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { SIMS_FOR_SHORT_REPORT } from '../../common/constants.js';
import privateConfig from '../../common/privateConfig.js';
import publicConfig from '../../common/publicConfig.js';
import logger from './logger.js';

/**
 * Return an object containing string lowercase kebab case sim names (e.g. acid-base-solutions) mapped to sim
 * titles (e.g. Acid-Base Solutions).
 *
 * @param {Object} simMetadata - sim metadata obtained from the PhET website
 * @param {Boolean} isTeamMember - whether a translator is a team member
 * @returns {Object} - sim names mapped to sim titles
 */
const getSimNamesAndTitles = ( simMetadata, isTeamMember ) => {
  logger.info( 'getting sim names and titles' );
  const simNamesAndTitles = {};
  try {
    for ( const project of simMetadata.projects ) {
      for ( const sim of project.simulations ) {

        // Decide whether this sim should be included in the list of those presented to the user based on the user's
        // credentials and the metadata associated with the sim.
        if ( sim.name === 'normal-modes' ) {
          console.log( `sim = ${JSON.stringify( sim, null, 2 )}` );
        }
        if ( isTeamMember || ( sim.visible || sim.isPrototype || sim.isCommunity ) ) {
          simNamesAndTitles[ sim.name ] = sim.localizedSimulations.en.title;
          console.log( `adding sim.name = ${sim.name}` );

          // TODO: For debug, remove soon, see https://github.com/phetsims/rosetta/issues/432.
        }
      }
    }
  }
  catch( e ) {
    logger.error( e );
    simNamesAndTitles.error = 'unable to get sim names and titles';
  }

  // If the configuration is set up to deliver a short report, filter the object to include fewer sims.
  if ( publicConfig.ENVIRONMENT === 'development' && privateConfig.SHORT_REPORT ) {
    logger.warn( 'using short report (fewer sims) based on configuration settings' );
    Object.keys( simNamesAndTitles ).forEach( key => {
      if ( SIMS_FOR_SHORT_REPORT.indexOf( key ) === -1 ) {
        delete simNamesAndTitles[ key ];
      }
    } );
  }
  return simNamesAndTitles;
};

export default getSimNamesAndTitles;