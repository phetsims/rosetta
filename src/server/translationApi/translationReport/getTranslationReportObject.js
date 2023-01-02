// Copyright 2022, University of Colorado Boulder

import privateConfig from '../../../common/privateConfig.js';
import publicConfig from '../../../common/publicConfig.js';
import getCategorizedStringKeys from '../getCategorizedStringKeys.js';
import getLatestSimSha from '../getLatestSimSha.js';
import getSimHtml from '../getSimHtml.js';
import getSimUrl from '../getSimUrl.js';
import getStringKeysWithRepoName from '../getStringKeysWithRepoName.js';
import logger from '../logger.js';
import { reportObjectCache } from '../translationApi.js';
import getCommonEnglishStringKeysAndValues from './getCommonEnglishStringKeysAndValues.js';
import getCommonTranslatedStringKeysAndValues from './getCommonTranslatedStringKeysAndValues.js';
import getSimSpecificEnglishStringKeysAndValues from './getSimSpecificEnglishStringKeysAndValues.js';
import getSimSpecificTranslatedStringKeysAndValues from './getSimSpecificTranslatedStringKeysAndValues.js';

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
    numSimSpecificStrings: null,
    numSimSpecificTranslatedStrings: wantsUntranslated === 'true' ? 0 : null,
    numSharedStrings: null,
    numSharedTranslatedStrings: null
  };

  // If the user is in development environment, and they set the short report
  // flag in their config file to true, just send a bunch of random data.
  // We do this to short-circuit having to do all the HTTP requests and computations
  // normally required for translation report objects.
  if ( publicConfig.ENVIRONMENT === 'development' && privateConfig.SHORT_REPORT ) {
    const getRandomInt = ( min, max ) => {
      return Math.floor( Math.random() * ( max - min ) + min );
    };
    const NUMERATOR_MIN = 0;
    const NUMERATOR_MAX = 20;
    const DENOMINATOR_MIN = 20;
    const DENOMINATOR_MAX = 100;
    translationReportObject.numCommonStrings = getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
    translationReportObject.numCommonTranslatedStrings = getRandomInt( NUMERATOR_MIN, NUMERATOR_MAX );
    translationReportObject.numSimSpecificStrings = getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
    translationReportObject.numSimSpecificTranslatedStrings = wantsUntranslated === 'true' ? 0 : getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
    translationReportObject.numSharedStrings = getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
    translationReportObject.numSharedTranslatedStrings = getRandomInt( NUMERATOR_MIN, NUMERATOR_MAX );
    return translationReportObject;
  }

  const simUrl = getSimUrl( simName );
  const simHtml = await getSimHtml( simUrl );
  const stringKeysWithRepoName = Object.keys( getStringKeysWithRepoName( simHtml ) );
  const categorizedStringKeys = await getCategorizedStringKeys( simName, simNames, stringKeysWithRepoName );

  const noLongerUsedFlag = 'no longer used';

  const commonEnglishStringKeysAndValues = await getCommonEnglishStringKeysAndValues(
    simName,
    simNames,
    categorizedStringKeys,
    stringKeysWithRepoName
  );
  translationReportObject.numCommonStrings = Object
    .values( commonEnglishStringKeysAndValues )
    .filter( value => value !== noLongerUsedFlag ).length;

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
                    && commonEnglishStringKeysAndValues[ key ] !== noLongerUsedFlag ).length;

  const latestSimSha = await getLatestSimSha( simName );
  const simSpecificEnglishStringKeysAndValues = await getSimSpecificEnglishStringKeysAndValues(
    simName,
    latestSimSha,
    categorizedStringKeys,
    stringKeysWithRepoName
  );
  translationReportObject.numSimSpecificStrings = Object
    .values( simSpecificEnglishStringKeysAndValues )
    .filter( value => value !== noLongerUsedFlag ).length;

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
               && simSpecificEnglishStringKeysAndValues[ key ] !== noLongerUsedFlag;
      } ).length;
  }

  // If there are shared strings for this sim, we need to get the stats for those.
  if ( categorizedStringKeys.shared.length > 0 ) {

    // It's possible a sim shares strings with multiple sims, hence the loop.
    for ( const sharedSim of categorizedStringKeys.sharedSims ) {

      const cachedSharedObject = reportObjectCache.getObject( locale, sharedSim );
      if ( cachedSharedObject ) {
        logger.info( 'using cached translation report object for shared sim stats' );
        translationReportObject.numSharedStrings = cachedSharedObject.numSimSpecificStrings;
        translationReportObject.numSharedTranslatedStrings = cachedSharedObject.numSimSpecificTranslatedStrings;
      }
      else {

        // If there isn't a cached translation report object, we have to get the stats
        // the hard way.

        // Get the English file.
        const sharedSimUrl = getSimUrl( sharedSim );
        const sharedSimHtml = await getSimHtml( sharedSimUrl );
        const sharedStringKeysWithRepoName = Object.keys( getStringKeysWithRepoName( sharedSimHtml ) );
        const sharedCategorizedStringKeys = await getCategorizedStringKeys( sharedSim, simNames, sharedStringKeysWithRepoName );
        const latestSimSha = await getLatestSimSha( sharedSim );
        logger.info( `getting shared sim-specific english string keys and values for ${sharedSim}` );
        const sharedEnglishStringKeysAndValues = await getSimSpecificEnglishStringKeysAndValues(
          sharedSim,
          latestSimSha,
          sharedCategorizedStringKeys,
          sharedStringKeysWithRepoName
        );
        translationReportObject.numSharedStrings = Object
          .values( sharedEnglishStringKeysAndValues )
          .filter( value => value !== noLongerUsedFlag ).length;

        // Get the translated file.
        if ( wantsUntranslated === 'false' ) {
          logger.info( `getting shared sim-specific translated string keys and values for ${sharedSim}` );
          const sharedTranslatedStringKeysAndValues = await getSimSpecificTranslatedStringKeysAndValues(
            sharedSim,
            locale,
            sharedCategorizedStringKeys
          );
          translationReportObject.numSharedTranslatedStrings = Object
            .keys( sharedTranslatedStringKeysAndValues )
            .filter( key => {
              return sharedTranslatedStringKeysAndValues[ key ] !== ''
                     && sharedEnglishStringKeysAndValues[ key ] !== noLongerUsedFlag;
            } ).length;
        }
      }
    }
  }

  return translationReportObject;
};

export default getTranslationReportObject;