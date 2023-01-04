// Copyright 2022, University of Colorado Boulder

/**
 * Create translation report table rows based on the translation report objects we get from the backend.
 * These rows contain statistics about translations such as how many sim-specific strings are translated, etc.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Link } from 'react-router-dom';
import getMinutesElapsed from '../../common/getMinutesElapsed.js';
import publicConfig from '../../common/publicConfig.js';
import StatsInfoButton from '../components/StatsInfoButton.jsx';
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

  const validMetadataMinutes = publicConfig.VALID_METADATA_DURATION / 1000 / 60;

  // Overwrite rows for which we have data.
  for ( const reportObject of reportObjects ) {

    // If the object is dirty, and there hasn't been enough time for an update, tell the user.
    // For background on why we do this, see https://github.com/phetsims/rosetta/issues/316.
    const minutesElapsed = getMinutesElapsed( reportObject.timestamp, Date.now() );

    // This is tied to sim metadata because the lists of translated and untranslated sims
    // are obtained from the sim metadata.
    const withinMetadataWindow = minutesElapsed < ( validMetadataMinutes * 2 );
    let pendingUpdate = <></>;
    if ( reportObject.isDirty && withinMetadataWindow ) {
      pendingUpdate = ' (pending update)';
    }

    if ( Object.keys( translationReportJsx ).includes( reportObject.simName ) ) {
      translationReportJsx[ reportObject.simName ] = (
        <tr key={reportObject.simName}>
          <td><Link to={`/translate/${locale}/${reportObject.simName}`}>{reportObject.simTitle}</Link>{pendingUpdate}</td>
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