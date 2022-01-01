// Copyright 2021, University of Colorado Boulder

import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getCommonEnglishStringKeysAndStrings from './getCommonEnglishStringKeysAndStrings.js';
import getCommonTranslatedStringKeysAndStrings from './getCommonTranslatedStringKeysAndStrings.js';
import getSimSpecificEnglishStringKeysAndStrings from './getSimSpecificEnglishStringKeysAndStrings.js';
import getSimSpecificTranslatedStringKeysAndStrings from './getSimSpecificTranslatedStringKeysAndStrings.js';
import logger from './logger.js';
import populateTranslationFormData from './populateTranslationFormData.js';
import { strict as assert } from 'assert';

const getTranslationFormData = async ( simName, locale ) => {

  logger.info( `getting ${locale}/${simName}'s translation form data` );

  const translationFormData = {
    simSpecific: {},
    common: {}
  };

  try {

    const categorizedStringKeys = await getCategorizedStringKeys( simName );

    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const simSpecificEnglishStringKeysAndStrings = await getSimSpecificEnglishStringKeysAndStrings( simName, categorizedStringKeys );
    const simSpecificTranslatedStringKeysAndStrings = await getSimSpecificTranslatedStringKeysAndStrings( simName, locale, categorizedStringKeys );

    const commonStringKeys = categorizedStringKeys.common;
    const commonEnglishStringKeysAndStrings = await getCommonEnglishStringKeysAndStrings( simName, categorizedStringKeys );
    const commonTranslatedStringKeysAndStrings = await getCommonTranslatedStringKeysAndStrings( simName, locale, categorizedStringKeys );

    logger.info( 'testing string keys from sim html equal string keys from long-term storage' );
    const simSpecificEnglishStringKeys = simSpecificEnglishStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( simSpecificStringKeys, simSpecificEnglishStringKeys );
    const simSpecificTranslatedStringKeys = simSpecificTranslatedStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( simSpecificStringKeys, simSpecificTranslatedStringKeys );
    const commonEnglishStringKeys = commonEnglishStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( commonStringKeys, commonEnglishStringKeys );
    const commonTranslatedStringKeys = commonTranslatedStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( commonStringKeys, commonTranslatedStringKeys );
    logger.info( 'tested string keys from sim html and string keys from long-term string storage; they are equal' );

    populateTranslationFormData(
      translationFormData,
      'sim-specific',
      simSpecificStringKeys,
      simSpecificEnglishStringKeysAndStrings,
      simSpecificTranslatedStringKeysAndStrings
    );
    populateTranslationFormData(
      translationFormData,
      'common',
      commonTranslatedStringKeys,
      commonEnglishStringKeysAndStrings,
      commonTranslatedStringKeysAndStrings
    );
  }
  catch( e ) {
    logger.error( e );
  }

  logger.info( `got ${locale}/${simName}'s translation form data; returning it` );
  return translationFormData;
};

export { getTranslationFormData as default };