// Copyright 2022, University of Colorado Boulder

/**
 * Export a function, see details below.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import { Locale, RepoName } from '../../../common/TypeAliases.js';
import getLocaleInfo from '../getLocaleInfo.js';
import getSimMetadata from '../getSimMetadata.js';

export type TranslationStatus = Record<RepoName, Record<Locale, { hasTranslation: boolean }>>;

/**
 * Get an object that indicates for each potential combination of sim and locale whether a translation exists.
 *
 * @param isTeamMember - Whether a translator is a PhET team member.  If true, some sims that are not visible to the
 *                       public will be included in the results.
 */
const getTranslationStatus = async ( isTeamMember: boolean ): Promise<TranslationStatus> => {

  // Create the object that will be returned. It will be populated in the subsequent code.
  const translationStatus: TranslationStatus = {};

  const localesList = Object.keys( await getLocaleInfo() );
  const simMetadata = await getSimMetadata();

  // Loop through all sims listed in the metadata and all possible locales to populate the object.
  for ( const project of simMetadata.projects ) {
    for ( const sim of project.simulations ) {
      if ( isTeamMember || ( sim.visible || sim.isPrototype || sim.isCommunity ) ) {
        const simName = sim.name;
        const localizedSimsList = Object.keys( sim.localizedSimulations );
        for ( const locale of localesList ) {
          if ( !translationStatus[ simName ] ) {
            translationStatus[ simName ] = {};
          }
          translationStatus[ simName ][ locale ] = {
            hasTranslation: localizedSimsList.includes( locale )
          };
        }
      }
    }
  }
  return translationStatus;
};

export default getTranslationStatus;