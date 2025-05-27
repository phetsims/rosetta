// Copyright 2023, University of Colorado Boulder

/**
 * Attach the total stats to the translation report object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import ReportObject from '../../../common/ReportObject.js';
import getTotalStrings from './getTotalStrings.js';

/**
 * Return the translation report object with total stats.
 *
 * @param translationReportObject - translation report object without total stats
 * @returns - translation report object with total stats
 */
const getTotalStats = ( translationReportObject: ReportObject ): ReportObject => {

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

  return translationReportObject;
};

export default getTotalStats;