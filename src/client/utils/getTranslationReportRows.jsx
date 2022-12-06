// Copyright 2022, University of Colorado Boulder

import { Link } from 'react-router-dom';
import getMinutesElapsed from 'server/translationApi/api/getMinutesElapsed.js';
import getSortedTranslationReportRows from './getSortedTranslationReportRows.jsx';

const getTranslationReportRows = (
  simNamesAndTitles,
  listOfSims,
  reportObjects,
  locale,
  reportPopulated,
  sortKey,
  sortDirection,
  numberOfEvents = null
) => {

  if ( reportPopulated ) {
    return getSortedTranslationReportRows(
      listOfSims,
      reportObjects,
      locale,
      sortKey,
      sortDirection
    );
  }

  const translationReportJsx = {};

  // Initially, set all rows to loading.
  if ( !numberOfEvents ) {
    for ( const simName of listOfSims ) {
      translationReportJsx[ simName ] = (
        <tr key={simName}>
          <td><Link to={`/translate/${locale}/${simName}`}>{simNamesAndTitles[ simName ]}</Link></td>
          <td>Loading...</td>
          <td>Loading...</td>
        </tr>
      );
    }
  }
  else {
    for ( let i = 0; i < numberOfEvents; i++ ) {
      translationReportJsx[ listOfSims[ i ] ] = (
        <tr key={listOfSims[ i ]}>
          <td><Link to={`/translate/${locale}/${listOfSims[ i ]}`}>{simNamesAndTitles[ listOfSims[ i ] ]}</Link></td>
          <td>Loading...</td>
          <td>Loading...</td>
        </tr>
      );
    }
  }

  // Overwrite rows for which we have data.
  for ( const reportObject of reportObjects ) {

    // If the object is dirty, and there hasn't been enough time for an update, tell the user.
    // For background on why we do this, see https://github.com/phetsims/rosetta/issues/316.
    const minutesElapsed = getMinutesElapsed( reportObject.timestamp, Date.now() );
    const lessThanTenMinutesSinceCache = minutesElapsed < 10;
    let pendingUpdate = <></>;
    if ( reportObject.isDirty && lessThanTenMinutesSinceCache ) {
      pendingUpdate = '(pending update) ';
    }

    // Create the row JSX.
    const simSpecificPercent = Math.floor( ( reportObject.numSimSpecificTranslatedStrings / reportObject.numSimSpecificStrings ) * 100 );
    const commonPercent = Math.floor( ( reportObject.numCommonTranslatedStrings / reportObject.numCommonStrings ) * 100 );
    if ( Object.keys( translationReportJsx ).includes( reportObject.simName ) ) {
      translationReportJsx[ reportObject.simName ] = (
        <tr key={reportObject.simName}>
          <td><Link to={`/translate/${locale}/${reportObject.simName}`}>{reportObject.simTitle}</Link></td>
          <td>{pendingUpdate}{simSpecificPercent}% ({reportObject.numSimSpecificTranslatedStrings} of {reportObject.numSimSpecificStrings})</td>
          <td>{pendingUpdate}{commonPercent}% ({reportObject.numCommonTranslatedStrings} of {reportObject.numCommonStrings})</td>
        </tr>
      );
    }
  }

  // Return an array of JSX.
  const translationReportRows = [];
  for ( const simName of Object.keys( translationReportJsx ) ) {
    translationReportRows.push( translationReportJsx[ simName ] );
  }

  return translationReportRows;
};

export default getTranslationReportRows;