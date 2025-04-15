// Copyright 2022, University of Colorado Boulder

/**
 * Shared function, see header for details.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import getLocaleInfo from '../getLocaleInfo.js';
import getSimMetadata from '../getSimMetadata.js';

/**
 * Return an object that can be used to look up whether a translation exists for any sim+locale combination.
 *
 * @param {Boolean} isTeamMember - whether a translator is a team member
 * @returns {Promise<Object>} - an object with sim names for the 1st keys, two-letter locales for the 2nd, and an object
 *                              with a boolean indicating whether a translation exists.  Here's a rough example:
 *                              {
 *                                acid-base-solutions: {
 *                                  aa: {hasTranslation: false},
 *                                  ab: {hasTranslation: false},
 *                                  .
 *                                  .
 *                                  .
 *                                }
 *                                .
 *                                .
 *                                .
 *                              }
 */
const getTranslationInfo = async isTeamMember => {

  // Create the object that will be returned.  It will be populated in the subsequent code.
  const translationInfo = {};

  const localesList = Object.keys( await getLocaleInfo() );
  const simMetadata = await getSimMetadata();

  // Loop through all sims listed in the metadata and all possible locales to populate the object.
  for ( const project of simMetadata.projects ) {
    for ( const sim of project.simulations ) {
      if ( isTeamMember || ( sim.visible || sim.isPrototype || sim.isCommunity ) ) {
        const simName = sim.name;
        const localizedSimsList = Object.keys( sim.localizedSimulations );
        for ( const locale of localesList ) {
          if ( translationInfo[ simName ] === undefined ) {
            translationInfo[ simName ] = {};
          }
          if ( localizedSimsList.includes( locale ) ) {
            translationInfo[ simName ][ locale ] = {
              hasTranslation: true
            };
          }
          else {
            translationInfo[ simName ][ locale ] = {
              hasTranslation: false
            };
          }
        }
      }
    }
  }
  return translationInfo;
};

// Uncomment this code if you want a local copy of translation info.
// import fs from 'fs';
//
// ( async () => {
//   const translationInfo = await getTranslationInfo();
//   fs.writeFileSync( './translationInfo.json', JSON.stringify( translationInfo, null, 4 ) );
// } )();

export default getTranslationInfo;