// Copyright 2023, University of Colorado Boulder

/**
 * Attach the total stats to the translation report object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getPercentOfTranslatedStrings from './getPercentOfTranslatedStrings.js';
import getTotalStrings from './getTotalStrings.js';
import TranslationReportObject from './TranslationReportObject.js';

/**
 * Return the translation report object with total stats.
 *
 * @param translationReportObject - translation report object without total stats
 * @returns - translation report object with total stats
 */
const getTotalStats = ( translationReportObject: TranslationReportObject ): TranslationReportObject => {

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
  translationReportObject.percentTotal = getPercentOfTranslatedStrings(
    translationReportObject.totalTranslatedStrings,
    translationReportObject.totalStrings
  );
  return translationReportObject;
};

export default getTotalStats;