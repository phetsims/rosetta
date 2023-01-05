// Copyright 2023, University of Colorado Boulder

/**
 * Create a randomized translation report object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getPercent from './getPercent.js';
import getTotalStats from './getTotalStats.js';

/**
 * Get a random integer in the specified range.
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
const getRandomInt = ( min, max ) => {
  return Math.floor( Math.random() * ( max - min ) + min );
};

/**
 * If the user is in development environment, and they set the short report
 * flag in their config file to true, just send a bunch of random data.
 * We do this to short-circuit having to do all the HTTP requests and computations
 * normally required for translation report objects.
 *
 * @param {Object} translationReportObject - translation report object
 * @param {String} wantsUntranslated - whether the caller wants untranslated (unpublished) sim stats
 * @returns {Object} - short report object
 */
const getShortReportObject = ( translationReportObject, wantsUntranslated ) => {
  const NUMERATOR_MIN = 0;
  const NUMERATOR_MAX = 20;
  const DENOMINATOR_MIN = 20;
  const DENOMINATOR_MAX = 100;
  translationReportObject.numCommonStrings = getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
  translationReportObject.numCommonTranslatedStrings = getRandomInt( NUMERATOR_MIN, NUMERATOR_MAX );
  translationReportObject.percentCommon = getPercent(
    translationReportObject.numCommonTranslatedStrings,
    translationReportObject.numCommonStrings
  );
  translationReportObject.numSimSpecificStrings = getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
  translationReportObject.numSimSpecificTranslatedStrings = wantsUntranslated === 'true' ? 0 : getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
  translationReportObject.percentSimSpecific = getPercent(
    translationReportObject.numSimSpecificTranslatedStrings,
    translationReportObject.numSimSpecificStrings
  );
  translationReportObject.numSharedStrings = getRandomInt( DENOMINATOR_MIN, DENOMINATOR_MAX );
  translationReportObject.numSharedTranslatedStrings = getRandomInt( NUMERATOR_MIN, NUMERATOR_MAX );
  translationReportObject.percentShared = getPercent(
    translationReportObject.numSharedTranslatedStrings,
    translationReportObject.numSharedStrings
  );
  return getTotalStats( translationReportObject );
};

export default getShortReportObject;