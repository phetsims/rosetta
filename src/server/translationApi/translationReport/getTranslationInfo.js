// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns an object that tells whether a given sim/locale combo has a translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getLocaleInfo from '../getLocaleInfo.js';
import getSimMetadata from '../getSimMetadata.js';

/**
 * Return an object that tells whether a given sim/locale combo has a translation.
 *
 * @param {String} isTeamMember - whether a translator is a team member
 * @returns {Promise<Object>} - translation info
 */
const getTranslationInfo = async isTeamMember => {
  const translationInfo = {};
  const localeInfo = await getLocaleInfo();
  const localesList = Object.keys( localeInfo );
  const simMetadata = await getSimMetadata();
  for ( const project of simMetadata.projects ) {
    for ( const sim of project.simulations ) {
      if ( isTeamMember === 'true' || ( sim.visible || sim.isPrototype ) ) {
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