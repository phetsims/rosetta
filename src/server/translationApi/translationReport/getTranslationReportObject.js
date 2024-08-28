// Copyright 2022, University of Colorado Boulder

/**
 * Shared function, see function header for details.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { NO_LONGER_USED_FLAG } from '../../../common/constants.js';
import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getLatestSimSha from '../getLatestSimSha.js';
import getStringKeysUsedInSim from '../getStringKeysUsedInSim.js';
import logger from '../logger.js';
import getCommonEnglishStringKeysAndValues from './getCommonEnglishStringKeysAndValues.js';
import getCommonTranslatedStringKeysAndValues from './getCommonTranslatedStringKeysAndValues.js';
import getPercentOfTranslatedStrings from './getPercentOfTranslatedStrings.js';
import getSharedTranslatedStringKeysAndValues from './getSharedTranslatedStringKeysAndValues.js';
import getSimSpecificEnglishStringKeysAndValues from './getSimSpecificEnglishStringKeysAndValues.js';
import getSimSpecificTranslatedStringKeysAndValues from './getSimSpecificTranslatedStringKeysAndValues.js';
import getTotalStats from './getTotalStats.js';

/**
 * Get an object containing the information needed to populate a row in the "translation report", which is a report that
 * displays information about how much of each sim is translated for a given locale.
 * @param {string} simName
 * @param {string} locale
 * @param {string[]} simNames
 * @param {string} simTitle
 * @param {boolean} wantsUntranslated
 * @returns {Promise<Object>}
 */
const getTranslationReportObject = async (
  simName,
  locale,
  simNames,
  simTitle,
  wantsUntranslated
) => {
  const translationReportObject = {
    simName: simName,
    simTitle: simTitle,
    numCommonStrings: null,
    numCommonTranslatedStrings: null,
    percentCommon: null,
    numSimSpecificStrings: null,
    numSimSpecificTranslatedStrings: wantsUntranslated ? 0 : null,
    percentSimSpecific: null,
    numSharedStrings: null,
    numSharedTranslatedStrings: wantsUntranslated ? 0 : null,
    percentShared: null,
    totalStrings: null,
    totalTranslatedStrings: null,
    percentTotal: null
  };

  // Get the string keys used by the specified sim.
  const stringKeysWithRepoName = Object.keys( await getStringKeysUsedInSim( simName ) );

  // Sort the string keys into sim-specific or common-code categories.
  const categorizedStringKeys = await getCategorizedStringKeys( simName, stringKeysWithRepoName );

  // Maintenance Note: In January 2024 there was some work done on this file to make it use the new method for obtaining
  // the set of used strings.  I (jbphet) started thinking the code below could be simplified to use the string values
  // from the sim instead of pulling them from the GitHub files they way they do below.  However, I think it may do this
  // because it needs to identify strings that are no longer used.  Future maintainers of this code should know this.

  const commonEnglishStringKeysAndValues = await getCommonEnglishStringKeysAndValues(
    simName,
    simNames,
    categorizedStringKeys,
    stringKeysWithRepoName
  );
  translationReportObject.numCommonStrings = Object
    .values( commonEnglishStringKeysAndValues )
    .filter( value => value !== NO_LONGER_USED_FLAG ).length;

  const commonTranslatedStringKeysAndValues = await getCommonTranslatedStringKeysAndValues(
    simName,
    locale,
    simNames,
    stringKeysWithRepoName,
    categorizedStringKeys
  );
  translationReportObject.numCommonTranslatedStrings = Object
    .keys( commonTranslatedStringKeysAndValues )
    .filter( key => commonTranslatedStringKeysAndValues[ key ] !== ''
                    && commonEnglishStringKeysAndValues[ key ] !== NO_LONGER_USED_FLAG ).length;

  translationReportObject.percentCommon = getPercentOfTranslatedStrings(
    translationReportObject.numCommonTranslatedStrings,
    translationReportObject.numCommonStrings
  );

  const latestSimSha = await getLatestSimSha( simName );
  const simSpecificEnglishStringKeysAndValues = await getSimSpecificEnglishStringKeysAndValues(
    simName,
    latestSimSha,
    categorizedStringKeys,
    stringKeysWithRepoName
  );
  translationReportObject.numSimSpecificStrings = Object
    .values( simSpecificEnglishStringKeysAndValues )
    .filter( value => value !== NO_LONGER_USED_FLAG ).length;

  if ( !wantsUntranslated ) {
    const simSpecificTranslatedStringKeysAndValues = await getSimSpecificTranslatedStringKeysAndValues(
      simName,
      locale,
      categorizedStringKeys
    );
    translationReportObject.numSimSpecificTranslatedStrings = Object
      .keys( simSpecificTranslatedStringKeysAndValues )
      .filter( key => {
        return simSpecificTranslatedStringKeysAndValues[ key ] !== ''
               && simSpecificEnglishStringKeysAndValues[ key ] !== NO_LONGER_USED_FLAG;
      } ).length;
  }

  translationReportObject.percentSimSpecific = getPercentOfTranslatedStrings(
    translationReportObject.numSimSpecificTranslatedStrings,
    translationReportObject.numSimSpecificStrings
  );

  // If there are shared strings for this sim, we need to get the stats for those.
  if ( categorizedStringKeys.shared.length > 0 ) {

    // Set the number of shared strings to be the number we get from the categorized string keys object.
    translationReportObject.numSharedStrings = categorizedStringKeys.shared.length;

    if ( !wantsUntranslated ) {

      // Create an array for collecting the translated string keys and values for the shared strings.
      const sharedTranslatedStringKeysAndValuesArray = [];

      // By convention, it's not possible a sim shares strings with multiple sims, but as of this writing there's
      // nothing preventing this, hence the loop.
      for ( const sharedSim of categorizedStringKeys.sharedSims ) {

        // Get the translated keys and values.
        logger.info( `getting shared sim-specific translated string keys and values for ${sharedSim}` );
        const sharedTranslatedStringKeysAndValues = await getSharedTranslatedStringKeysAndValues(
          sharedSim,
          locale,
          categorizedStringKeys.shared
        );
        sharedTranslatedStringKeysAndValuesArray.push( sharedTranslatedStringKeysAndValues );
      }

      // Loop through the shared string keys and see if any of the translated string keys and values objects have a
      // value for that key.
      for ( const sharedKey of categorizedStringKeys.shared ) {
        for ( const sharedTranslatedStringKeysAndValues of sharedTranslatedStringKeysAndValuesArray ) {
          if (
            sharedTranslatedStringKeysAndValues[ sharedKey ] &&
            sharedTranslatedStringKeysAndValues[ sharedKey ] !== ''
          ) {
            translationReportObject.numSharedTranslatedStrings++;
            break;
          }
        }
      }
    }

    translationReportObject.percentShared = getPercentOfTranslatedStrings(
      translationReportObject.numSharedTranslatedStrings,
      translationReportObject.numSharedStrings
    );
  }

  return getTotalStats( translationReportObject );
};

export default getTranslationReportObject;