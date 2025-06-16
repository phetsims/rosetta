// Copyright 2022, University of Colorado Boulder

/**
 * Shared function, see function header for details.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { NO_LONGER_USED_FLAG } from '../../../common/constants.js';
import ReportObject from '../../../common/ReportObject.js';
import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getLatestSimSha from '../getLatestSimSha.js';
import getStringKeysUsedInSim from '../getStringKeysUsedInSim.js';
import logger from '../logger.js';
import getCommonEnglishStringKeysAndValues from './getCommonEnglishStringKeysAndValues.js';
import getCommonTranslatedStringKeysAndValues from './getCommonTranslatedStringKeysAndValues.js';
import getSharedTranslatedStringKeysAndValues from './getSharedTranslatedStringKeysAndValues.js';
import getSimSpecificEnglishStringKeysAndValues from './getSimSpecificEnglishStringKeysAndValues.js';
import getSimSpecificTranslatedStringKeysAndValues from './getSimSpecificTranslatedStringKeysAndValues.js';

/**
 * Get an object containing the information needed to populate a row in the "translation report", which is a report that
 * displays information about how much of each sim is translated for a given locale.
 * @param simName
 * @param locale
 * @param simNames
 * @param simTitle
 */
const getTranslationReportObject = async ( simName: string,
                                           locale: string,
                                           simNames: string[],
                                           simTitle: string ): Promise<ReportObject> => {

  const translationReportObject: ReportObject = {
    simName: simName,
    simTitle: simTitle,

    // string counts
    numCommonStrings: 0,
    numCommonTranslatedStrings: 0,
    numSimSpecificStrings: 0,
    numSimSpecificTranslatedStrings: 0,
    numSharedStrings: 0,
    numSharedTranslatedStrings: 0,
    totalStrings: 0,
    totalTranslatedStrings: 0,

    // percentages
    commonPercent: 0,
    simSpecificPercent: 0,
    sharedPercent: 0,
    totalPercent: 0,

    // cache metadata
    isDirty: true,
    timestamp: Number.NEGATIVE_INFINITY
  };

  // Get the information needed to populate the translation report object.
  try {

    // Get the string keys used by the specified sim.
    const stringKeysWithRepoName = Object.keys( await getStringKeysUsedInSim( simName ) );

    // Sort the string keys into sim-specific, common-code, or shared categories.
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

    // If there are shared strings for this sim, we need to get the stats for those.
    if ( categorizedStringKeys.shared.length > 0 ) {

      // Set the number of shared strings to be the number we get from the categorized string keys object.
      translationReportObject.numSharedStrings = categorizedStringKeys.shared.length;

      // Create an array for collecting the translated string keys and values for the shared strings.
      const sharedTranslatedStringKeysAndValuesArray = [];

      // By PhET convention, sims don't share strings with multiple other sims (though the DO often share strings with
      // multiple common-code repos), but as of this writing there's nothing preventing this, hence the loop.
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

    // Since we made it to this point, consider the object to be valid.
    translationReportObject.isDirty = false;
    translationReportObject.timestamp = Date.now();
  }
  catch( e ) {
    logger.error( `error while obtaining info for translation report object, report may be inaccurate, error = ${e}` );
  }

  // Calculate the totals.
  translationReportObject.totalStrings = translationReportObject.numCommonStrings +
                                          translationReportObject.numSimSpecificStrings +
                                          translationReportObject.numSharedStrings;
  translationReportObject.totalTranslatedStrings = translationReportObject.numCommonTranslatedStrings +
                                                   translationReportObject.numSimSpecificTranslatedStrings +
                                                   translationReportObject.numSharedTranslatedStrings;

  // Calculate the percentages.
  translationReportObject.simSpecificPercent = translationReportObject.numSimSpecificStrings > 0
    ? Math.floor( ( translationReportObject.numSimSpecificTranslatedStrings / translationReportObject.numSimSpecificStrings ) * 100 )
    : 0;
  translationReportObject.commonPercent = translationReportObject.numCommonStrings > 0
    ? Math.floor( ( translationReportObject.numCommonTranslatedStrings / translationReportObject.numCommonStrings ) * 100 )
    : 0;
  translationReportObject.sharedPercent = translationReportObject.numSharedStrings > 0
    ? Math.floor( ( translationReportObject.numSharedTranslatedStrings / translationReportObject.numSharedStrings ) * 100 )
    : 0;
  translationReportObject.totalPercent = translationReportObject.totalStrings > 0
    ? Math.floor( ( translationReportObject.totalTranslatedStrings / translationReportObject.totalStrings ) * 100 )
    : 0;

  return translationReportObject;
};

export default getTranslationReportObject;