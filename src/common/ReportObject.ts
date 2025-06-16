// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for the data used to populate a row in the translation report.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

type ReportObject = {

  // The title of the sim, e.g. "Build an Atom"
  simTitle: string;

  // The name of the repo where the sim's source code resides, e.g. "build-an-atom"
  simName: string;

  // A flag indicating whether the report object is "dirty" and needs to be updated.  An example of when this would be
  // true is if a new translation was submitted for the sim and locale.
  isDirty: boolean;

  // In milliseconds, used by the cache to decide if the report object should be updated.
  timestamp: number;

  // Counts for the various categories of strings.
  numSimSpecificStrings: number;
  numSimSpecificTranslatedStrings: number;
  numSharedTranslatedStrings: number;
  numSharedStrings: number;
  numCommonTranslatedStrings: number;
  numCommonStrings: number;

  // Total counts.
  totalTranslatedStrings: number;
  totalStrings: number;

  // Percentages
  commonPercent: number;
  simSpecificPercent: number;
  sharedPercent: number;
  totalPercent: number;
};

export type ReportObjectSortingKeys = 'simTitle' | 'totalStrings' | 'totalPercent';

export default ReportObject;