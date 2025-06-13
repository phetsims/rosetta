// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for the data used in the translation report.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type ReportObject = {
  simTitle: string;
  simName: string;
  isDirty: boolean;
  timestamp: number; // milliseconds, used by the cache to decide if the report object should be updated

  numSimSpecificTranslatedStrings: number;
  numSimSpecificStrings: number;

  numSharedTranslatedStrings: number;
  numSharedStrings: number | null;

  numCommonTranslatedStrings: number;
  numCommonStrings: number;

  totalTranslatedStrings: number;
  totalStrings: number;
};

// This type represents a ReportObject after its percentages have been calculated/re-calculated
// by `getReportObjectsWithCalculatedPercentages`
export type ReportObjectWithCalculatedPercentages = ReportObject & {
  commonPercent: number;
  simSpecificPercent: number;
  sharedPercent: number;
  totalPercent: number;
};

export type ReportObjectSortingKeys = 'simTitle' | 'totalStrings' | 'totalPercent';

export default ReportObject;