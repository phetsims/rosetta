// Copyright 2022, University of Colorado Boulder

/**
 * Get an object that can be used to look up whether a translation exists for any sim+locale combination.
 *
 * @param isTeamMember - whether a translator is a team member
 * @returns A promise resolving to an object with sim names for the 1st keys, two-letter locales for the 2nd, and an object
 *          with a boolean indicating whether a translation exists.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import getLocaleInfo from '../getLocaleInfo.js';
import getSimMetadata from '../getSimMetadata.js';

type TranslationInfo = Record<string, Record<string, { hasTranslation: boolean }>>;

const getTranslationInfo = async ( isTeamMember: boolean ): Promise<TranslationInfo> => {

  // Create the object that will be returned. It will be populated in the subsequent code.
  const translationInfo: TranslationInfo = {};

  const localesList = Object.keys( await getLocaleInfo() );
  const simMetadata = await getSimMetadata();

  // Loop through all sims listed in the metadata and all possible locales to populate the object.
  for ( const project of simMetadata.projects ) {
    for ( const sim of project.simulations ) {
      if ( isTeamMember || ( sim.visible || sim.isPrototype || sim.isCommunity ) ) {
        const simName = sim.name;
        const localizedSimsList = Object.keys( sim.localizedSimulations );
        for ( const locale of localesList ) {
          if ( !translationInfo[ simName ] ) {
            translationInfo[ simName ] = {};
          }
          translationInfo[ simName ][ locale ] = {
            hasTranslation: localizedSimsList.includes( locale )
          };
        }
      }
    }
  }
  return translationInfo;
};

export default getTranslationInfo;