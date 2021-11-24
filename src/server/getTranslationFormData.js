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

  const translationFormData = {
    simSpecific: {},
    common: {}
  };

  try {

    const categorizedStringKeys = await getCategorizedStringKeys( simName );

    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const simSpecificEnglishStringKeysAndStrings = await getSimSpecificEnglishStringKeysAndStrings( simName );
    const simSpecificTranslatedStringKeysAndStrings = await getSimSpecificTranslatedStringKeysAndStrings( simName, locale );

    const commonStringKeys = categorizedStringKeys.common;
    const commonEnglishStringKeysAndStrings = await getCommonEnglishStringKeysAndStrings( simName );
    const commonTranslatedStringKeysAndStrings = await getCommonTranslatedStringKeysAndStrings( simName, locale );

    const simSpecificEnglishStringKeys = simSpecificEnglishStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( simSpecificStringKeys, simSpecificEnglishStringKeys );
    const simSpecificTranslatedStringKeys = simSpecificTranslatedStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( simSpecificStringKeys, simSpecificTranslatedStringKeys );
    const commonEnglishStringKeys = commonEnglishStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( commonStringKeys, commonEnglishStringKeys );
    const commonTranslatedStringKeys = commonTranslatedStringKeysAndStrings.map( stringKeyAndString => stringKeyAndString[ 0 ] );
    assert.deepEqual( commonStringKeys, commonTranslatedStringKeys );

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

  return translationFormData;
};

export { getTranslationFormData as default };