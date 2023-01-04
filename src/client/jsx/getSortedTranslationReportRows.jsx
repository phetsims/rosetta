// Copyright 2022, University of Colorado Boulder

/**
 * Create an array of sorted translation report table rows based on the key given for sorting.
 * These rows are JSX.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Link } from 'react-router-dom';
import getMinutesElapsed from '../../common/getMinutesElapsed.js';
import publicConfig from '../../common/publicConfig.js';
import StatsInfoButton from '../components/StatsInfoButton.jsx';
import alertErrorMessage from '../js/alertErrorMessage.js';
import SortDirectionEnum from '../js/SortDirectionEnum.js';

/**
 * Return an array of translation report objects (i.e. stats used to make translation report rows) that have
 * percentages of translated sim-specific strings and translated common strings.
 *
 * @param {Object[]} reportObjects
 * @returns {Object[]}
 */
const getReportObjectsWithPercentages = reportObjects => {
  const reportObjectsWithPercents = [];
  for ( const reportObject of reportObjects ) {
    const simSpecificPercent = Math.floor( ( reportObject.numSimSpecificTranslatedStrings / reportObject.numSimSpecificStrings ) * 100 );
    const commonPercent = Math.floor( ( reportObject.numCommonTranslatedStrings / reportObject.numCommonStrings ) * 100 );
    const hasSharedStrings = reportObject.numSharedStrings !== null;

    // By default, set shared percent to 0. We do this because otherwise the table wouldn't be sortable.
    let sharedPercent = 0;
    if ( hasSharedStrings ) {
      sharedPercent = Math.floor( ( reportObject.numSharedTranslatedStrings / reportObject.numSharedStrings ) * 100 );
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
 *
 * @param {Object} a - report object A
 * @param {Object} b - report object B
 * @param {String} sortKey - key we're using to sort
 * @param {String} fallbackKey - key we use to break ties
 * @param {String} sortDirection - ascending or descending
 */
const sortReportObjects = ( a, b, sortKey, fallbackKey, sortDirection ) => {

  let sortResult = 0;

  // Parameter checking.
  if ( typeof a[ sortKey ] !== typeof b[ sortKey ] ) {
    alertErrorMessage( 'Values being sorted are not the same type.' );
  }
  const valuesAreStrings = typeof a[ sortKey ] === 'string' && typeof b[ sortKey ] === 'string';

  // If sort keys are strings, we want to sort them without regard to case.
  let itemA = a[ sortKey ];
  let itemB = b[ sortKey ];
  if ( valuesAreStrings ) {
    itemA = itemA.toLowerCase();
    itemB = itemB.toLowerCase();
  }

  if ( sortDirection === SortDirectionEnum.ASCENDING ) {
    if ( itemA === itemB && fallbackKey !== null ) {
      sortResult = sortReportObjects( a, b, fallbackKey, null, sortDirection );
    }
    else {
      sortResult = itemA > itemB ? 1 : -1;
    }
  }
  else if ( sortDirection === SortDirectionEnum.DESCENDING ) {
    if ( itemA === itemB && fallbackKey !== null ) {
      sortResult = sortReportObjects( a, b, fallbackKey, null, sortDirection );
    }
    else {
      sortResult = itemA > itemB ? -1 : 1;
    }
  }
  else {
    alertErrorMessage( 'Sort direction should be either ascending or descending.' );
  }

  return sortResult;
};

/**
 * Sort the report objects with percentages according to the sort key provided, in the direction provided.
 *
 * @param {Object[]} reportObjectsWithPercentages - translation report objects with percentages for translated strings
 * @param {String} sortDirection - ascending or descending
 * @param {String[]} sortKeys - array of keys to sort by
 * @returns {Object[]} - sorted report objects with percentages
 */
const sortReportObjectsWithPercentages = ( reportObjectsWithPercentages, sortDirection, sortKeys ) => {
  return reportObjectsWithPercentages.sort( ( a, b ) => {
    const fallbackKey = sortKeys.length > 1 ? sortKeys[ 1 ] : null;
    return sortReportObjects( a, b, sortKeys[ 0 ], fallbackKey, sortDirection );
  } );
};

/**
 * Return sorted translation rows, i.e. an array of JSX to put in the translation report table.
 *
 * @param {String[]} listOfSims
 * @param {Object[]} reportObjects
 * @param {String} locale
 * @param {String[]} sortKeys
 * @param {String} sortDirection
 * @returns {Object[]}
 */
const getSortedTranslationReportRows = (
  listOfSims,
  reportObjects,
  locale,
  sortKeys,
  sortDirection
) => {

  // Get report objects we're interested in.
  // We could want to sort the published sims or the unpublished sims.
  const reportObjectsToSort = [];
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

  const validMetadataMinutes = publicConfig.VALID_METADATA_DURATION / 1000 / 60;

  // Create the array of JSX to render in the translation report.
  const translationReportJsx = [];
  for ( const item of sortedData ) {

    // If the object is dirty, and there hasn't been enough time for an update, tell the user.
    // For background on why we do this, see https://github.com/phetsims/rosetta/issues/316.
    const minutesElapsed = getMinutesElapsed( item.timestamp, Date.now() );

    // This is tied to sim metadata because the lists of translated and untranslated sims
    // are obtained from the sim metadata.
    const withinMetadataWindow = minutesElapsed < ( validMetadataMinutes * 2 );
    let pendingUpdate = <></>;
    if ( item.isDirty && withinMetadataWindow ) {
      pendingUpdate = '(pending update) ';
    }

    translationReportJsx.push(
      <tr key={item.simName}>
        <td><Link to={`/translate/${locale}/${item.simName}`}>{item.simTitle}</Link>{pendingUpdate}</td>
        <td>
          <StatsInfoButton reportObject={item}/>
          {item.percentTotal}% ({item.totalTranslatedStrings} of {item.totalStrings})
        </td>
      </tr>
    );
  }

  return translationReportJsx;
};

export default getSortedTranslationReportRows;