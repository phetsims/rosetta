// Copyright 2022, University of Colorado Boulder

/**
 * Create translation report table rows based on the translation report objects we get from the backend.
 * These rows contain statistics about translations such as how many sim-specific strings are translated, etc.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ReportObject, SimNamesAndTitles } from '../clientTypes';
import '../styles/table.css';
import StatsInfoButton from '../components/StatsInfoButton';
import getSortedTranslationReportRows from './getSortedTranslationReportRows';

type TranslationReport = {
  [ key: string ]: ReactElement;
};

/**
 * Return an array of translation report table rows, i.e. return an array of JSX. These rows are put into the
 * translation report table.
 */
const getTranslationReportRows = (
  simNamesAndTitles: SimNamesAndTitles,
  listOfSims: string[],
  reportObjects: ReportObject[],
  locale: string,
  reportPopulated: boolean,
  sortKeys: string[],
  sortDirection: string,
  showStats: boolean
): ReactElement[] => {

  const translationReportJsx: TranslationReport = {};
  if ( !showStats ) {

    // If we are not supposed to show stats (i.e. there are not enough GitHub
    // API requests left in our hourly limit), then just show a link to the
    // translation page for each sim.
    for ( const simName of listOfSims ) {
      translationReportJsx[ simName ] = (
        <tr key={simName}>
          <td><Link to={`/translate/${locale}/${simName}`}>{simNamesAndTitles[ simName ]}</Link></td>
          <td>--</td>
        </tr>
      );
    }
  }
  else {

    // Otherwise, if we have enough GitHub API requests left in our hourly limit,
    // then show stats for each sim.

    if ( reportPopulated ) {
      return getSortedTranslationReportRows(
        listOfSims,
        reportObjects,
        locale,
        sortKeys,
        sortDirection
      );
    }

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

      let pendingUpdateMessage: ReactElement = <></>;
      if ( reportObject.isDirty ) {
        pendingUpdateMessage = <> (pending update)</>;
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
  }

  // Return an array of JSX.
  const translationReportRows: ReactElement[] = [];
  for ( const simName of Object.keys( translationReportJsx ) ) {
    translationReportRows.push( translationReportJsx[ simName ] );
  }

  return translationReportRows;
};

export default getTranslationReportRows;