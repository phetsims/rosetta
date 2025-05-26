// Copyright 2022, University of Colorado Boulder

/**
 * Create an array of sorted translation report table rows based on the key given for sorting.
 * These rows are JSX.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ReportObject } from '../clientTypes.js';
import StatsInfoButton from '../components/StatsInfoButton';
import alertErrorMessage from '../js/alertErrorMessage';
import SortDirectionEnum from '../js/SortDirectionEnum';
import '../styles/table.css';

type ReportObjectWithPercentages = ReportObject & {
  commonPercent: number;
  simSpecificPercent: number;
  sharedPercent: number;
};

/**
 * Return an array of translation report objects (i.e. stats used to make translation report rows) that have percentages
 * of translated sim-specific strings and translated common strings.
 */
const getReportObjectsWithPercentages = ( reportObjects: ReportObject[] ): ReportObjectWithPercentages[] => {
  const reportObjectsWithPercents: ReportObjectWithPercentages[] = [];
  for ( const reportObject of reportObjects ) {
    const simSpecificPercent = Math.floor( ( reportObject.numSimSpecificTranslatedStrings / reportObject.numSimSpecificStrings ) * 100 );
    const commonPercent = Math.floor( ( reportObject.numCommonTranslatedStrings / reportObject.numCommonStrings ) * 100 );
    const hasSharedStrings = reportObject.numSharedStrings !== null;

    // By default, set shared percent to 0. We do this because otherwise the table wouldn't be sortable.
    let sharedPercent = 0;
    if ( hasSharedStrings ) {
      sharedPercent = Math.floor( ( reportObject.numSharedTranslatedStrings / reportObject.numSharedStrings! ) * 100 );
    }
    reportObjectsWithPercents.push( {
      ...reportObject,
      commonPercent: commonPercent,
      simSpecificPercent: simSpecificPercent,
      sharedPercent: sharedPercent
    } );
  }
  return reportObjectsWithPercents;
};

/**
 * Return a number used to sort the report objects.
 */
const sortReportObjects = (
  a: ReportObjectWithPercentages,
  b: ReportObjectWithPercentages,
  sortKey: string,
  fallbackKey: string | null,
  sortDirection: string
): number => {
  let sortResult = 0;

  // Parameter checking.
  if ( typeof a[ sortKey ] !== typeof b[ sortKey ] ) {
    void alertErrorMessage(
      'Values being sorted are not the same type.'
    );
  }
  const valuesAreStrings = typeof a[ sortKey ] === 'string' && typeof b[ sortKey ] === 'string';

  // If sort keys are strings, we want to sort them without regard to case.
  let itemA = a[ sortKey ];
  let itemB = b[ sortKey ];
  if ( valuesAreStrings ) {
    itemA = ( itemA as string ).toLowerCase();
    itemB = ( itemB as string ).toLowerCase();
  }

  if ( sortDirection === SortDirectionEnum.ASCENDING ) {
    if ( itemA === itemB && fallbackKey !== null ) {
      sortResult = sortReportObjects( a, b, fallbackKey, null, sortDirection );
    }
    else {
      sortResult = itemA! > itemB! ? 1 : -1;
    }
  }
  else if ( sortDirection === SortDirectionEnum.DESCENDING ) {
    if ( itemA === itemB && fallbackKey !== null ) {
      sortResult = sortReportObjects( a, b, fallbackKey, null, sortDirection );
    }
    else {
      sortResult = itemA! > itemB! ? -1 : 1;
    }
  }
  else {
    void alertErrorMessage( 'Sort direction should be either ascending or descending.' as string );
  }

  return sortResult;
};

/**
 * Sort the report objects with percentages according to the sort key provided, in the direction provided.
 */
const sortReportObjectsWithPercentages = (
  reportObjectsWithPercentages: ReportObjectWithPercentages[],
  sortDirection: string,
  sortKeys: string[]
): ReportObjectWithPercentages[] => {
  return [ ...reportObjectsWithPercentages ].sort( ( a, b ) => {
    const fallbackKey = sortKeys.length > 1 ? sortKeys[ 1 ] : null;
    return sortReportObjects( a, b, sortKeys[ 0 ], fallbackKey, sortDirection );
  } );
};

/**
 * Return sorted translation rows, i.e. an array of JSX to put in the translation report table.
 */
const getSortedTranslationReportRows = (
  listOfSims: string[],
  reportObjects: ReportObject[],
  locale: string,
  sortKeys: string[],
  sortDirection: string
): ReactElement[] => {
  // Get report objects we're interested in.
  // We could want to sort the published sims or the unpublished sims.
  const reportObjectsToSort: ReportObject[] = [];
  for ( const simName of listOfSims ) {
    for ( const reportObject of reportObjects ) {
      if ( simName === reportObject.simName ) {
        reportObjectsToSort.push( reportObject );
      }
    }
  }

  // Get percentages from report objects, and sort the report objects.
  const reportObjectsWithPercentages = getReportObjectsWithPercentages( reportObjectsToSort );
  const sortedData = sortReportObjectsWithPercentages(
    reportObjectsWithPercentages,
    sortDirection,
    sortKeys
  );

  const tdStyle = {
    width: '30%'
  };

  // Create the array of JSX to render in the translation report.
  const translationReportJsx: ReactElement[] = [];
  for ( const item of sortedData ) {
    let pendingUpdateMessage: ReactElement = <></>;
    if ( item.isDirty ) {
      pendingUpdateMessage = <> (pending update)</>;
    }

    translationReportJsx.push(
      <tr key={item.simName}>
        <td style={tdStyle}><Link to={`/translate/${locale}/${item.simName}`}>{item.simTitle}</Link>{pendingUpdateMessage}</td>
        <td style={tdStyle}>
          <StatsInfoButton reportObject={item}/>
          {item.percentTotal}% ({item.totalTranslatedStrings} of {item.totalStrings})
        </td>
      </tr>
    );
  }

  return translationReportJsx;
};

export default getSortedTranslationReportRows;