// Copyright 2025, University of Colorado Boulder

/**
 * Type definition for the data used in the translation report.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

//  TODO: See https://github.com/phetsims/rosetta/issues/311.  This type was extracted while converting Rosetta to
//        TypeScript.  There are several things that strike me (jbphet) as problematic about it, and I'd like to revisit
//        these before declaring the conversion complete.  For instance, why are the number values nullable?  Also,
//        the totals and percent values are all set as values, and it seems a lot safer if this was an object with
//        getters and setters that dynamically calculated the values.

type TranslationReportObject = {
  simName: string;
  simTitle: string;
  numCommonStrings: number | null;
  numCommonTranslatedStrings: number | null;
  percentCommon: number | null;
  numSimSpecificStrings: number | null;
  numSimSpecificTranslatedStrings: number | null;
  percentSimSpecific: number | null;
  numSharedStrings: number | null;
  numSharedTranslatedStrings: number | null;
  percentShared: number | null;
  totalStrings: number | null;
  totalTranslatedStrings: number | null;
  percentTotal: number | null;
  isDirty: boolean; // used by the cache to mark the object as dirty and force an update on the next access
  timestamp: number; // used by the cache to decide if the report object should be updated
};

export default TranslationReportObject;