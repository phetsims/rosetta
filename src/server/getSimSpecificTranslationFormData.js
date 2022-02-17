// Copyright 2022, University of Colorado Boulder

/**
 * @author Liam Mulhall
 */

import axios from 'axios';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';
import logger from './logger.js';

const getSimSpecificTranslationFormData = async ( simName, locale, categorizedStringKeys ) => {

  const simSpecific = {};

  try {

    // we need to get sim-specific string keys
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;

    // get english file
    // the english file should exist
    // if it doesn't exist, we've got a serious problem, houston
    let simSpecificEnglishStringFileUrl = '';
    let simSpecificEnglishStringFileRes = {};
    let simSpecificEnglishStringKeysAndStrings = {};
    try {
      simSpecificEnglishStringFileUrl = getStringFileUrl( simName );
      simSpecificEnglishStringFileRes = await axios.get( simSpecificEnglishStringFileUrl );
      simSpecificEnglishStringKeysAndStrings = simSpecificEnglishStringFileRes.data;
    }
    catch( e ) {
      logger.error( e );
    }

    // get translated file
    // the translated file might not exist
    let simSpecificTranslatedStringFileUrl = '';
    let simSpecificTranslatedStringFileRes = {};
    let simSpecificTranslatedStringKeysAndStrings = {};
    try {
      simSpecificTranslatedStringFileUrl = getTranslatedStringFileUrl( simName, locale );
      simSpecificTranslatedStringFileRes = await axios.get( simSpecificTranslatedStringFileUrl );
      simSpecificTranslatedStringKeysAndStrings = simSpecificTranslatedStringFileRes.data;
    }
    catch( e ) {
      if ( e.response.status === 404 ) {
        logger.verbose( `translation file for ${simName} doesn't exist; setting empty strings for ${simName}` );
      }
      else {
        logger.error( e );
      }
    }

    /*
     * For each sim-specific string key, we need to:
     * (1) get the string key's English value,
     * (2) get the string key's translated value, and
     * (3) add the string key and its values to the sim-specific object
     */
    for ( const stringKey of simSpecificStringKeys ) {

      // get the english value
      let englishValue = '';
      if ( simSpecificEnglishStringKeysAndStrings[ stringKey ] ) {
        englishValue = simSpecificEnglishStringKeysAndStrings[ stringKey ].value;
      }

      // get the translated value
      let translatedValue = '';
      if ( simSpecificTranslatedStringKeysAndStrings[ stringKey ] ) {
        translatedValue = simSpecificTranslatedStringKeysAndStrings[ stringKey ].value;
      }

      // strip out the dots to make it easier for the client to parse the translation form data
      const stringKeyWithoutDots = stringKey.replaceAll( '.', '_DOT_' );

      // add the string key and its values to the sim-specific object
      simSpecific[ stringKeyWithoutDots ] = {
        english: englishValue,
        translated: translatedValue,   // the user will be able to modify this value
        oldTranslated: translatedValue // the user won't be able to modify this value; it will be used for history
      };
    }
  }
  catch( e ) {
    logger.error( e );
  }


  return simSpecific;
};

export default getSimSpecificTranslationFormData;