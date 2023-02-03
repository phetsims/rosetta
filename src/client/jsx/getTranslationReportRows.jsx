// Copyright 2022, University of Colorado Boulder

/**
 * Create translation report table rows based on the translation report objects we get from the backend.
 * These rows contain statistics about translations such as how many sim-specific strings are translated, etc.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Link } from 'react-router-dom';
import StatsInfoButton from '../components/StatsInfoButton.jsx';
import getSortedTranslationReportRows from './getSortedTranslationReportRows.jsx';
// eslint-disable-next-line bad-text
import '../styles/table.css';

/**
 * Return an array of translation report table rows, i.e. return an array of JSX. These rows are put into the
 * translation report table.
 *
 * @param {Object} simNamesAndTitles - object where keys are sim names and values are sim titles
 * @param {String[]} listOfSims - list of sim names, either untranslated or translated
 * @param {Object[]} reportObjects - report objects we get from the backend
 * @param {String} locale - ISO 639-1 locale code for which the report is being made
 * @param {Boolean} reportPopulated - boolean telling whether we have all the report objects
 * @param {String[]} sortKeys - which key to sort by, only used when the report is populated
 * @param {String} sortDirection - either ascending or descending
 * @returns {Object[]} - array of report rows, i.e. array of JSX
 */
const getTranslationReportRows = (
  simNamesAndTitles,
  listOfSims,
  reportObjects,
  locale,
  reportPopulated,
  sortKeys,
  sortDirection
) => {

  if ( reportPopulated ) {
    return getSortedTranslationReportRows(
      listOfSims,
      reportObjects,
      locale,
      sortKeys,
      sortDirection
    );
  }

  const translationReportJsx = {};

  // Initially, set all rows to loading.
  for ( const simName of listOfSims ) {
    translationReportJsx[ simName ] = (
      <tr key={simName}>
        <td><Link to={`/translate/${locale}/${simName}`}>{simNamesAndTitles[ simName ]}</Link></td>
        <td>Loading...</td>
      </tr>
    );
  }

  // Overwrite rows for which we have data.
  for ( const reportObject of reportObjects ) {

    let pendingUpdateMessage = <></>;
    if ( reportObject.isDirty ) {
      pendingUpdateMessage = ' (pending update)';
    }

    if ( Object.keys( translationReportJsx ).includes( reportObject.simName ) ) {
      translationReportJsx[ reportObject.simName ] = (
        <tr key={reportObject.simName}>
          <td><Link to={`/translate/${locale}/${reportObject.simName}`}>{reportObject.simTitle}</Link>{pendingUpdateMessage}</td>
          <td>
            <StatsInfoButton reportObject={reportObject}/>
            {reportObject.percentTotal}% ({reportObject.totalTranslatedStrings} of {reportObject.totalStrings})
          </td>
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