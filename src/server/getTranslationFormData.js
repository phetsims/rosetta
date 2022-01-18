// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets all the data needed to render the translation form.
 *
 * @author Liam Mulhall
 */

import getCategorizedStringKeys from './getCategorizedStringKeys.js';
import getCommonEnglishStringKeysAndStrings from './getCommonEnglishStringKeysAndStrings.js';
import getCommonTranslatedStringKeysAndStrings from './getCommonTranslatedStringKeysAndStrings.js';
import getSimHtml from './getSimHtml.js';
import getSimNames from './getSimNames.js';
import getSimSpecificEnglishStringKeysAndStrings from './getSimSpecificEnglishStringKeysAndStrings.js';
import getSimSpecificTranslatedStringKeysAndStrings from './getSimSpecificTranslatedStringKeysAndStrings.js';
import getSimUrl from './getSimUrl.js';
import getStringKeysWithRepoName from './getStringKeysWithRepoName.js';
import logger from './logger.js';
import populateTranslationFormData from './populateTranslationFormData.js';
import { strict as assert } from 'assert';

/**
 * Return the translation form data for a given sim and locale. The translation form data is sent to the client to
 * populate the translation form, which is the form a user fills in to translate a sim. The fields in the form are
 * separated into two sections: (1) sim-specific and (2) common. Sim-specific strings only appear in the sim being
 * translated whereas common strings appear in multiple sims.
 *
 * @param {String} simName - sim name
 * @param {String} locale - two-letter ISO 639-1 locale code, e.g. es for Spanish
 * @returns {Promise<{simSpecific: {}, common: {}}>} - translation form data
 */
const getTranslationFormData = async ( simName, locale ) => {

  logger.info( `getting ${locale}/${simName}'s translation form data` );

  const translationFormData = {
    simSpecific: {},
    common: {}
  };

  try {

    // get the data we need to proceed
    const simUrl = getSimUrl( simName );
    const simHtml = await getSimHtml( simUrl );
    const stringKeysWithRepoName = getStringKeysWithRepoName( simHtml );
    const simNames = await getSimNames();
    const categorizedStringKeys = await getCategorizedStringKeys( simName, simNames, stringKeysWithRepoName );

    // get sim-specific data
    const simSpecificStringKeys = categorizedStringKeys.simSpecific;
    const simSpecificEnglishStringKeysAndStrings = await getSimSpecificEnglishStringKeysAndStrings( simName, categorizedStringKeys );
    const simSpecificTranslatedStringKeysAndStrings = await getSimSpecificTranslatedStringKeysAndStrings( simName, locale, categorizedStringKeys );

    // get common data
    const commonStringKeys = categorizedStringKeys.common;
    const commonEnglishStringKeysAndStrings = await getCommonEnglishStringKeysAndStrings( simName, simNames, categorizedStringKeys, stringKeysWithRepoName );
    const commonTranslatedStringKeysAndStrings = await getCommonTranslatedStringKeysAndStrings( simName, locale, categorizedStringKeys, stringKeysWithRepoName );

    // ensure data we get from the sim html equals data we get from long-term storage (github as of this writing)
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

    // use a utility function to populate translation form data with sim-specific data
    populateTranslationFormData(
      translationFormData,
      'sim-specific',
      simSpecificStringKeys,
      simSpecificEnglishStringKeysAndStrings,
      simSpecificTranslatedStringKeysAndStrings
    );

    // use a utility function to populate translation form data with common data
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

export default getTranslationFormData;