// Copyright 2022, University of Colorado Boulder

/**
 * Return an object containing string lowercase kebab case sim names (e.g. acid-base-solutions) mapped to sim
 * titles (e.g. Acid-Base Solutions).
 *
 * @param simMetadata - sim metadata obtained from the PhET website
 * @param isTeamMember - whether a translator is a team member
 * @returns An object mapping sim names to sim titles
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import { SIMS_FOR_SHORT_REPORT } from '../../common/constants.js';
import privateConfig from '../../common/privateConfig.js';
import publicConfig from '../../common/publicConfig.js';
import logger from './logger.js';
import { SimMetadata } from './SimMetadataTypes.js';

type SimNamesAndTitles = Record<string, string | undefined>;

const getSimNamesAndTitles = ( simMetadata: SimMetadata, isTeamMember: boolean ): SimNamesAndTitles => {
  logger.info( 'getting sim names and titles' );
  let simNamesAndTitles: SimNamesAndTitles = {};
  try {
    for ( const project of simMetadata.projects ) {
      for ( const sim of project.simulations ) {
        if ( isTeamMember || sim.visible || sim.isPrototype || sim.isCommunity ) {
          simNamesAndTitles[ sim.name ] = sim.localizedSimulations.en.title;
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
    simNamesAndTitles = Object.fromEntries(
      Object.entries( simNamesAndTitles ).filter( ( [ key ] ) => SIMS_FOR_SHORT_REPORT.includes( key ) )
    );
  }

  return simNamesAndTitles;
};

export default getSimNamesAndTitles;