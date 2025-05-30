// Copyright 2025, University of Colorado Boulder

/**
 * Utility function to handle the translation report data
 *
 * @author Agustín Vallejo + Gemini 2.5
 */

import ReportObject, { ReportObjectSortingKeys } from '../../common/ReportObject.js';
import SortDirectionEnum from '../js/SortDirectionEnum';

/**
 * Prepares and sorts translation report data for display.
 * This function orchestrates filtering, percentage calculation, and sorting.
 * It returns an array of *data objects*, ready to be mapped to JSX.
 */
const getSortedTranslationReport = (
  listOfSims: string[],
  reportObjects: ReportObject[], // These are the raw report objects from the backend
  sortKeys: ReportObjectSortingKeys[],
  sortDirection: string
): ReportObject[] => {

  // Filter: Include only report objects for the sims in listOfSims.
  const filteredReportObjects = reportObjects.filter( reportObject =>
    listOfSims.includes( reportObject.simName )
  );

  return getSortedReportData(
    filteredReportObjects,
    sortDirection,
    sortKeys
  );
};

/**
 * Sorts an array of report objects by multiple keys.
 * This is the refined sorting function that takes care of multiple sort keys.
 */
const getSortedReportData = (
  reportObjectsWithPercentages: ReportObject[],
  sortDirection: string,
  sortKeys: ReportObjectSortingKeys[]
): ReportObject[] => {
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
 * Compares two report objects based on a single sort key and direction.
 */
const compareReportObjectsByKey = (
  a: ReportObject,
  b: ReportObject,
  sortKey: ReportObjectSortingKeys,
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
  const comparison = itemA > itemB ? 1 : ( itemA < itemB ? -1 : 0 );

  return sortDirection === SortDirectionEnum.ASCENDING ? comparison : -comparison;
};

export { getSortedTranslationReport };