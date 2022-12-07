// Copyright 2022, University of Colorado Boulder

/**
 * Create translation report table rows based on the translation report objects we get from the backend.
 * These rows contain statistics about translations such as how many sim-specific strings are translated, etc.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Link } from 'react-router-dom';
import getMinutesElapsed from '../../common/getMinutesElapsed.js';
import getSortedTranslationReportRows from './getSortedTranslationReportRows.jsx';

/**
 * Return an array of translation report table rows, i.e. return an array of JSX. These rows are put into the
 * translation report table.
 *
 * @param {Object} simNamesAndTitles - object where keys are sim names and values are sim titles
 * @param {String[]} listOfSims - list of sim names, either untranslated or translated
 * @param {Object[]} reportObjects - report objects we get from the backend
 * @param {String} locale - ISO 639-1 locale code for which the report is being made
 * @param {Boolean} reportPopulated - boolean telling whether we have all the report objects
 * @param {String} sortKey - which key to sort by, only used when the report is populated
 * @param {String} sortDirection - either ascending or descending
 * @param {Number} numberOfEvents - now used in production; umber of report objects; useful for debugging
 * @returns {Object[]} - array of report rows, i.e. array of JSX
 */
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