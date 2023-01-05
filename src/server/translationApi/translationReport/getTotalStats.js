// Copyright 2023, University of Colorado Boulder

/**
 * Attach the total stats to the translation report object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getPercent from './getPercent.js';
import getTotalStrings from './getTotalStrings.js';

/**
 * Return the translation report object with total stats.
 *
 * @param {Object} translationReportObject - translation report object without total stats
 * @returns {Object}
 */
const getTotalStats = translationReportObject => {
  translationReportObject.totalStrings = getTotalStrings( [
    translationReportObject.numCommonStrings,
    translationReportObject.numSimSpecificStrings,
    translationReportObject.numSharedStrings
  ] );
  translationReportObject.totalTranslatedStrings = getTotalStrings( [
    translationReportObject.numCommonTranslatedStrings,
    translationReportObject.numSimSpecificTranslatedStrings,
    translationReportObject.numSharedTranslatedStrings
  ] );
  translationReportObject.percentTotal = getPercent(
    translationReportObject.totalTranslatedStrings,
    translationReportObject.totalStrings
  );
  return translationReportObject;
};

export default getTotalStats;