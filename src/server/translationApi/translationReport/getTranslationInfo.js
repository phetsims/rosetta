// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that returns an object that tells whether a given sim/locale combo has a translation.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import config from '../../../common/config.js';
import getLocaleInfo from '../getLocaleInfo.js';
import getSimMetadata from '../getSimMetadata.js';

/**
 * Return an object that tells whether a given sim/locale combo has a translation.
 *
 * @returns {Promise<Object>} - translation info
 */
const getTranslationInfo = async () => {
  const translationInfo = {};
  const localeInfo = await getLocaleInfo();
  const localesList = Object.keys( localeInfo );
  const simMetadata = await getSimMetadata();
  for ( const project of simMetadata.projects ) {
    for ( const sim of project.simulations ) {
      const wantSimVisible = config.common.ENVIRONMENT === 'development' ||
                             ( config.common.ENVIRONMENT === 'production' &&
                               ( sim.visible || sim.isPrototype ) );
      if ( wantSimVisible ) {
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