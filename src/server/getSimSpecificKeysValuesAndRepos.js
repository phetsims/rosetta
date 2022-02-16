// Copyright 2022, University of Colorado Boulder

/**
 * @author Liam Mulhall
 */

import axios from 'axios';
import getStringFileUrl from './getStringFileUrl.js';
import getTranslatedStringFileUrl from './getTranslatedStringFileUrl.js';

const getSimSpecificKeysValuesAndRepos = async ( simName, locale, categorizedStringKeys ) => {

  const simSpecific = {};

  // we need to get sim-specific string keys
  const simSpecificStringKeys = categorizedStringKeys.simSpecific;

  // we need the english string file for the sim
  const simSpecificEnglishStringFileUrl = getStringFileUrl( simName );
  const simSpecificEnglishStringFileRes = await axios.get( simSpecificEnglishStringFileUrl );
  const simSpecificEnglishStringKeysAndStrings = simSpecificEnglishStringFileRes.data;

  // we need the translated string file for the sim
  const simSpecificTranslatedStringFileUrl = getTranslatedStringFileUrl( simName, locale );
  const simSpecificTranslatedStringFileRes = await axios.get( simSpecificTranslatedStringFileUrl );
  const simSpecificTranslatedStringKeysAndStrings = simSpecificTranslatedStringFileRes.data;

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

    // add the string key and its values to the sim-specific object
    simSpecific[ stringKey ] = {
      english: englishValue,
      translated: translatedValue
    };
  }

  return simSpecific;
};

export default getSimSpecificKeysValuesAndRepos;