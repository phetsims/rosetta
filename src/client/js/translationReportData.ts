// Copyright 2025, University of Colorado Boulder

/**
 * Utility function to handle the translation report data
 *
 * @author Agustín Vallejo + Gemini 2.5
 */

import { ReportObject, ReportObjectWithCalculatedPercentages } from '../ClientDataTypes.js';
import SortDirectionEnum from '../js/SortDirectionEnum';

/**
 * Return an array of translation report objects with calculated percentages.
 * This takes the raw ReportObject and computes/adds the specific percentage fields.
 */
const getReportObjectsWithCalculatedPercentages = ( reportObjects: ReportObject[] ): ReportObjectWithCalculatedPercentages[] => {
  const objectsWithCalculatedPercents: ReportObjectWithCalculatedPercentages[] = [];
  for ( const reportObject of reportObjects ) {
    // Ensure division by zero is handled to avoid NaN and provide a meaningful percentage (0).
    const simSpecificPercent = reportObject.numSimSpecificStrings > 0
                               ? Math.floor( ( reportObject.numSimSpecificTranslatedStrings / reportObject.numSimSpecificStrings ) * 100 )
                               : 0;

    const commonPercent = reportObject.numCommonStrings > 0
                          ? Math.floor( ( reportObject.numCommonTranslatedStrings / reportObject.numCommonStrings ) * 100 )
                          : 0;

    // Check if there are shared strings to avoid division by null/zero.
    let sharedPercent = 0;
    if ( reportObject.numSharedStrings !== null && reportObject.numSharedStrings > 0 ) {
      sharedPercent = Math.floor( ( reportObject.numSharedTranslatedStrings / reportObject.numSharedStrings ) * 100 );
    }

    let totalPercent = 0;
    if ( reportObject.totalStrings > 0 ) {
      totalPercent = Math.floor( ( reportObject.totalTranslatedStrings / reportObject.totalStrings ) * 100 );
    }

    objectsWithCalculatedPercents.push( {
      ...reportObject,
      commonPercent: commonPercent,
      simSpecificPercent: simSpecificPercent,
      sharedPercent: sharedPercent,
      totalPercent: totalPercent
    } );
  }
  return objectsWithCalculatedPercents;
};

/**
 * Compares two report objects based on a single sort key and direction.
 * This function should be pure and not have side effects like `alertErrorMessage`.
 * If types are inconsistent, it's better to log a warning or provide a default comparison.
 */
const compareReportObjectsByKey = (
  a: ReportObjectWithCalculatedPercentages,
  b: ReportObjectWithCalculatedPercentages,
  sortKey: string,
  sortDirection: string
): number => {
  let itemA = a[ sortKey ];
  let itemB = b[ sortKey ];

  // Handle potential type mismatches or undefined values gracefully in a sort function.
  // For sorting, it's crucial that values are comparable. If not, define a consistent fallback.
  if ( typeof itemA !== typeof itemB ) {
    console.warn( `Translation report sorting: Values for key "${sortKey}" have inconsistent types. a: ${typeof itemA}, b: ${typeof itemB}.` );
    // Fallback: Treat undefined/null as smaller to ensure consistent ordering.
    if ( itemA === undefined || itemA === null ) {
      return sortDirection === SortDirectionEnum.ASCENDING ? -1 : 1;
    }
    if ( itemB === undefined || itemB === null ) {
      return sortDirection === SortDirectionEnum.ASCENDING ? 1 : -1;
    }
    // If types are different but non-null/undefined, we might just compare them as-is or throw an error.
    // For robust sorting, ensure sortKey points to consistently typed properties.
  }

  const valuesAreStrings = typeof itemA === 'string' && typeof itemB === 'string';

  if ( valuesAreStrings ) {
    itemA = ( itemA as string ).toLowerCase();
    itemB = ( itemB as string ).toLowerCase();
  }

  // Standard comparison logic
  const comparison = itemA! > itemB! ? 1 : ( itemA! < itemB! ? -1 : 0 );

  return sortDirection === SortDirectionEnum.ASCENDING ? comparison : -comparison;
};

/**
 * Sorts an array of report objects by multiple keys.
 * This is the refined sorting function that takes care of multiple sort keys.
 */
const getSortedReportData = (
  reportObjectsWithPercentages: ReportObjectWithCalculatedPercentages[],
  sortDirection: string,
  sortKeys: string[]
): ReportObjectWithCalculatedPercentages[] => {
  // Use a copy to ensure immutability
  return [ ...reportObjectsWithPercentages ].sort( ( a, b ) => {
    for ( const sortKey of sortKeys ) {
      const result = compareReportObjectsByKey( a, b, sortKey, sortDirection );
      if ( result !== 0 ) {
        return result; // Found a difference, return it
      }
    }
    return 0; // All sort keys are equal, objects are considered equal
  } );
};

/**
 * Prepares and sorts translation report data for display.
 * This function orchestrates filtering, percentage calculation, and sorting.
 * It returns an array of *data objects*, ready to be mapped to JSX.
 */
const prepareSortedTranslationReportData = (
  listOfSims: string[],
  reportObjects: ReportObject[], // These are the raw report objects from the backend
  sortKeys: string[],
  sortDirection: string
): ReportObjectWithCalculatedPercentages[] => {

  // 1. Filter: Include only report objects for the sims in listOfSims.
  const filteredReportObjects = reportObjects.filter( reportObject =>
    listOfSims.includes( reportObject.simName )
  );

  // 2. Calculate Derived Values: Add/re-calculate percentages.
  const reportObjectsWithCalculatedPercentages = getReportObjectsWithCalculatedPercentages( filteredReportObjects );

  // 3. Sort: Sort the processed data.
  const sortedData = getSortedReportData(
    reportObjectsWithCalculatedPercentages,
    sortDirection,
    sortKeys
  );

  return sortedData;
};

export { prepareSortedTranslationReportData };