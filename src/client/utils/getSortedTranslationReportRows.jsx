// Copyright 2022, University of Colorado Boulder

import { Link } from 'react-router-dom';
import getMinutesElapsed from 'server/translationApi/api/getMinutesElapsed.js';

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

const getSortedTranslationReportRows = ( reportObjects, locale, sortKey, sortDirection ) => {

  // Get percentages from report objects, and sort the report objects.
  const reportObjectsWithPercentages = getReportObjectsWithPercentages( reportObjects );
  const sortedData = sortReportObjectsWithPercentages(
    reportObjectsWithPercentages,
    sortDirection,
    sortKey
  );

  // Create the array of JSX to render in the translation report.
  const translationReportJsx = [];
  for ( const item of sortedData ) {

    // If the object is dirty, and there hasn't been enough time for an update, tell the user.
    // For background on why we do this, see https://github.com/phetsims/rosetta/issues/316.
    const minutesElapsed = getMinutesElapsed( item.timestamp, Date.now() );
    const lessThanTenMinutesSinceCache = minutesElapsed < 10;
    let pendingUpdate = <></>;
    if ( item.isDirty && lessThanTenMinutesSinceCache ) {
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