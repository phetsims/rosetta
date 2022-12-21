// Copyright 2022, University of Colorado Boulder

/**
 * Create an object containing shared translation form data.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFile from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

/**
 * Get data needed for rendering shared string translation form table.
 *
 * @param {String} simName - name of sim we're getting data for
 * @param {String} locale - locale code of sim
 * @param {String[]} sharedStringKeys - list of shared string keys
 * @param {String[]} sharedSims - list of sims that share string keys
 * @returns {Promise<Object>} - shared translation form data
 */
const getSharedTranslationFormData = async (
  simName,
  locale,
  sharedStringKeys,
  sharedSims
) => {
  logger.info( 'getting shared translation form data' );
  const sharedTranslationFormData = {};

  // As of this writing, most sims do not have shared strings. Thus, we add a
  // check here to ensure there are shared string keys before making request
  // for string files.
  if ( sharedStringKeys.length > 0 ) {
    try {

      // Get string files.
      const englishStringFiles = [];
      const translatedStringFiles = [];
      for ( const sim of sharedSims ) {
        const simFileRes = await axios.get( getStringFileUrl( sim ) );
        englishStringFiles.push( simFileRes.data );
        try {
          const translatedFileRes = await axios.get( getTranslatedStringFile( sim, locale ) );
          if ( translatedFileRes.status >= 200 && translatedFileRes.status <= 300 ) {
            translatedStringFiles.push( translatedFileRes.data );
          }
        }
        catch( e ) {
          if ( e.response.status === 404 ) {
            logger.verbose( `translation file for ${simName} doesn't exist; setting empty strings for ${simName}` );
          }
          else {
            logger.error( e );
          }
        }
      }

      // Populate string keys and values.
      const englishKeysAndValues = {};
      const translatedKeysAndValues = {};
      for ( const stringKey of sharedStringKeys ) {

        // Populate English string keys and values.
        for ( const stringFile of englishStringFiles ) {
          if ( Object.keys( stringFile ).includes( stringKey ) ) {
            englishKeysAndValues[ stringKey ] = stringFile[ stringKey ].value;
          }
        }

        // Populate translated string keys and values.
        for ( const stringFile of translatedStringFiles ) {
          if ( Object.keys( stringFile ).includes( stringKey ) ) {
            translatedKeysAndValues[ stringKey ] = stringFile[ stringKey ].value;
          }
        }
      }

      // Create the shared translation form data object.
      for ( const stringKey of sharedStringKeys ) {

        // Strip out dots so client doesn't think there are more deeply nested
        // objects than there really are.
        const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );
        if ( englishKeysAndValues[ stringKey ] && translatedKeysAndValues[ stringKey ] ) {
          sharedTranslationFormData[ stringKeyWithoutDots ] = {
            english: englishKeysAndValues[ stringKey ],
            translated: translatedKeysAndValues[ stringKey ]
          };
        }
        else if ( englishKeysAndValues[ stringKey ] && !translatedKeysAndValues[ stringKey ] ) {
          sharedTranslationFormData[ stringKeyWithoutDots ] = {
            english: englishKeysAndValues[ stringKey ],
            translated: ''
          };
        }
      }
    }
    catch( e ) {
      logger.error( e );
    }
  }
  logger.info( 'returning shared translation form data' );
  return sharedTranslationFormData;
};

export default getSharedTranslationFormData;