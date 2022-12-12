// Copyright 2022, University of Colorado Boulder

/**
 * Create an array of sorted translation report table rows based on the key given for sorting.
 * These rows are JSX.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Link } from 'react-router-dom';
import { useContext } from 'react';
import getMinutesElapsed from '../../common/getMinutesElapsed.js';
import { ConfigContext } from '../components/Rosetta.jsx';

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
    reportObjectsWithPercents.push( {
      simName: reportObject.simName,
      simTitle: reportObject.simTitle,
      commonPercent: commonPercent,
      numCommonStrings: reportObject.numCommonStrings,
      numCommonTranslatedStrings: reportObject.numCommonTranslatedStrings,
      simSpecificPercent: simSpecificPercent,
      numSimSpecificStrings: reportObject.numSimSpecificStrings,
      numSimSpecificTranslatedStrings: reportObject.numSimSpecificTranslatedStrings,
      isDirty: reportObject.isDirty,
      timestamp: reportObject.timestamp
    } );
  }
  return reportObjectsWithPercents;
};

/**
 * Sort the report objects with percentages according to the sort key provided, in the direction provided.
 *
 * @param {Object[]} reportObjectsWithPercentages - translation report objects with percentages for translated strings
 * @param {String} sortDirection - ascending or descending
 * @param {String} sortKey - key to sort by (sim title, sim-specific percentage, or common percentage)
 * @returns {Object[]} - sorted report objects with percentages
 */
const sortReportObjectsWithPercentages = ( reportObjectsWithPercentages, sortDirection, sortKey ) => {
  return reportObjectsWithPercentages.sort( ( a, b ) => {
    if ( sortDirection === 'ascending' ) {
      return a[ sortKey ] > b[ sortKey ] ? 1 : -1;
    }
    else if ( sortDirection === 'descending' ) {
      return a[ sortKey ] > b[ sortKey ] ? -1 : 1;
    }
    return 0;
  } );
};

/**
 * Return sorted translation rows, i.e. an array of JSX to put in the translation report table.
 *
 * @param {String[]} listOfSims
 * @param {Object[]} reportObjects
 * @param {String} locale
 * @param {String} sortKey
 * @param {String} sortDirection
 * @returns {Object[]}
 */
const getSortedTranslationReportRows = (
  listOfSims,
  reportObjects,
  locale,
  sortKey,
  sortDirection
) => {

  // Get report objects we're interested in.
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
    sortKey
  );

  const config = useContext( ConfigContext );
  const validMetadataDuration = new Date( Number( config.common.VALID_METADATA_DURATION ) );
  const validMetadataMinutes = validMetadataDuration.getMinutes();

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
        <td><Link to={`/translate/${locale}/${item.simName}`}>{item.simTitle}</Link></td>
        <td>{pendingUpdate}{item.simSpecificPercent}% ({item.numSimSpecificTranslatedStrings} of {item.numSimSpecificStrings})</td>
        <td>{pendingUpdate}{item.commonPercent}% ({item.numCommonTranslatedStrings} of {item.numCommonStrings})</td>
      </tr>
    );
  }

  return translationReportJsx;
};

export default getSortedTranslationReportRows;