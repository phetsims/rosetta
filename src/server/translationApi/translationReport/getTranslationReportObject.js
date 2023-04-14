// Copyright 2022, University of Colorado Boulder

import { NO_LONGER_USED_FLAG } from '../../../common/constants.js';
import privateConfig from '../../../common/privateConfig.js';
import publicConfig from '../../../common/publicConfig.js';
import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getLatestSimSha from '../getLatestSimSha.js';
import getSimHtml from '../getSimHtml.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';
import logger from '../logger.js';
import getCommonEnglishStringKeysAndValues from './getCommonEnglishStringKeysAndValues.js';
import getCommonTranslatedStringKeysAndValues from './getCommonTranslatedStringKeysAndValues.js';
import getSharedTranslatedStringKeysAndValues from './getSharedTranslatedStringKeysAndValues.js';
import getPercent from './getPercent.js';
import getShortReportObject from './getShortReportObject.js';
import getSimSpecificEnglishStringKeysAndValues from './getSimSpecificEnglishStringKeysAndValues.js';
import getSimSpecificTranslatedStringKeysAndValues from './getSimSpecificTranslatedStringKeysAndValues.js';
import getTotalStats from './getTotalStats.js';

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
    numSimSpecificTranslatedStrings: wantsUntranslated === 'true' ? 0 : null,
    percentSimSpecific: null,
    numSharedStrings: null,
    numSharedTranslatedStrings: wantsUntranslated === 'true' ? 0 : null,
    percentShared: null,
    totalStrings: null,
    totalTranslatedStrings: null,
    percentTotal: null
  };

  // If the user is in development environment, and they set the short report
  // flag in their config file to true, just send a bunch of random data.
  // We do this to short-circuit having to do all the HTTP requests and computations
  // normally required for translation report objects.
  if ( publicConfig.ENVIRONMENT === 'development' && privateConfig.SHORT_REPORT ) {
    return getShortReportObject( translationReportObject );
  }

  const simUrl = getSimUrl( simName );
  const simHtml = await getSimHtml( simUrl );
  const stringKeysWithRepoName = Object.keys( getStringKeysWithRepoName( simHtml ) );
  const categorizedStringKeys = await getCategorizedStringKeys( simName, stringKeysWithRepoName );

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

  translationReportObject.percentCommon = getPercent(
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

  if ( wantsUntranslated === 'false' ) {
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

  translationReportObject.percentSimSpecific = getPercent(
    translationReportObject.numSimSpecificTranslatedStrings,
    translationReportObject.numSimSpecificStrings
  );

  // If there are shared strings for this sim, we need to get the stats for those.
  if ( categorizedStringKeys.shared.length > 0 ) {

    // Set the number of shared strings to be the number we get from the
    // categorized string keys object.
    translationReportObject.numSharedStrings = categorizedStringKeys.shared.length;

    if ( wantsUntranslated === 'false' ) {

      // Create an array for collecting the translated string keys and values
      // for the shared strings.
      const sharedTranslatedStringKeysAndValuesArray = [];

      // By convention, it's not possible a sim shares strings with multiple sims, but
      // as of this writing there's nothing preventing this, hence the loop.
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

      // Loop through the shared string keys and see if any of the translated
      // string keys and values objects have a value for that key.
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

    translationReportObject.percentShared = getPercent(
      translationReportObject.numSharedTranslatedStrings,
      translationReportObject.numSharedStrings
    );
  }

  return getTotalStats( translationReportObject );
};

export default getTranslationReportObject;