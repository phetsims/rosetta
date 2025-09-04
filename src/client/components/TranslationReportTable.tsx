// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that contains a sortable table of translated sims and their string statistics.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReportObjectSortingKeys } from '../../common/ReportObject.js';
import useTranslatedAndUntranslatedSims from '../hooks/useTranslatedAndUntranslatedSims.jsx';
import useTranslationReportObjects from '../hooks/useTranslationReportObjects.jsx';
import SortDirectionEnum from '../js/SortDirectionEnum.js';
import SortKeyEnum from '../js/SortKeyEnum.js';
import { getSortedTranslationReport } from '../js/translationReportData.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import NoStatsBanner from './NoStatsBanner.jsx';
import { SimNamesAndTitlesContext } from './RosettaRoutes.jsx';
import SortButton from './SortButton.jsx';
import TranslationReportTableRow from './TranslationReportTableRow.jsx';

type TranslationReportTableProps = {
  locale: string;
  localeName: string;
  wantsUntranslated: boolean;
  showStats: boolean;
};

/**
 * Return a sortable table used in the translation report. The user can sort it by sim title or the percent of
 * translated strings.
 */
const TranslationReportTable: React.FC<TranslationReportTableProps> = ( {
                                                                          locale,
                                                                          localeName,
                                                                          wantsUntranslated,
                                                                          showStats
                                                                        } ): ReactElement => {

  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );

  // Get report objects consisting of translation report data.
  // Assuming `reportObjects` here is an array of `ReportObject`.
  const { reportPopulated, reportObjects } = useTranslationReportObjects(
    locale,
    wantsUntranslated,
    showStats
  );

  // State variables used in sorting the table.
  const [ sortKeys, setSortKeys ] = useState<ReportObjectSortingKeys[]>( SortKeyEnum.SIM_TITLE );
  const [ sortDirection, setSortDirection ] = useState<string>( SortDirectionEnum.ASCENDING );

  const translatedAndUntranslatedSims = useTranslatedAndUntranslatedSims( locale );

  // Determine the list of sims relevant for the current view (translated or untranslated)
  const listOfSims = translatedAndUntranslatedSims
                     ? ( wantsUntranslated ? translatedAndUntranslatedSims.untranslated : translatedAndUntranslatedSims.translated )
                     : []; // Default to empty array if data not yet loaded

  let tableRows: ReactElement[] = [];
  let headerMessage: ReactElement = <></>;

  // Conditional rendering based on `showStats` and `reportPopulated`
  if ( !showStats ) {
    // If we are not supposed to show stats (e.g., GitHub API limit hit)
    headerMessage = <NoStatsBanner/>;
    tableRows = listOfSims.map( simName => (
      <tr key={simName}>
        <td><Link to={`/translate/${locale}/${simName}`}>{simNamesAndTitles[ simName ]}</Link></td>
        <td>--</td>
      </tr>
    ) );
  }
  else if ( !reportPopulated ) {
    // If stats are enabled but data is still loading
    headerMessage = <p>Translation data loading... <LoadingSpinner/></p>;
    tableRows = listOfSims.map( simName => {
      // If there's already a reportObject with this simName, use the TranslationReportTableRow
      const existingReport = reportObjects.find( obj => obj.simName === simName );
      if ( existingReport ) {
        return <TranslationReportTableRow key={simName} item={existingReport} locale={locale}/>;
      }
      else {
        return <tr key={simName}>
          <td><Link to={`/translate/${locale}/${simName}`}>{simNamesAndTitles[ simName ]}</Link></td>
          <td>Loading...</td>
        </tr>;
      }
    } );
  }
  else {
    // Stats are populated, prepare and sort the data
    const sortedReportData = getSortedTranslationReport(
      listOfSims,
      reportObjects,
      sortKeys,
      sortDirection
    );

    // Determine specific messages for empty lists
    const allSimsTranslated = wantsUntranslated && sortedReportData.length === 0;
    const noSimsTranslated = !wantsUntranslated && sortedReportData.length === 0;

    if ( allSimsTranslated ) {
      tableRows.push( <tr key='all-translated'>
        <td colSpan={2}><p>All sims translated, check percentages.</p></td>
      </tr> );
    }
    else if ( noSimsTranslated ) {
      tableRows.push( <tr key='no-translated'>
        <td colSpan={2}><p>No sims translated.</p></td>
      </tr> );
    }
    else {
      // Map sorted data to TranslationReportTableRow components
      tableRows = sortedReportData.map( item => (
        <TranslationReportTableRow key={item.simName} item={item} locale={locale}/>
      ) );
    }
  }

  // Handler for sort button clicks
  const handleSortButtonClick = ( newSortKeys: ReportObjectSortingKeys[] ): void => {
    setSortKeys( newSortKeys );
    // Toggle sort direction
    setSortDirection( prevDirection =>
      prevDirection === SortDirectionEnum.ASCENDING
      ? SortDirectionEnum.DESCENDING
      : SortDirectionEnum.ASCENDING
    );
  };

  return (
    <div className='mt-4'>
      {headerMessage}
      <h3>
        {
          wantsUntranslated
          ? `Sims not yet published in ${localeName} (${locale})`
          : `Sims published in ${localeName} (${locale})`
        }
      </h3>
      <table className='table table-striped'>
        <thead>
        <tr>
          <th>Sim Title
            {
              // Show sort button only if data is populated, there's more than one sim, and stats are shown
              reportPopulated && listOfSims.length > 1 && showStats
              ? <SortButton onClick={() => handleSortButtonClick( SortKeyEnum.SIM_TITLE )}/>
              : <></>
            }
          </th>
          <th>Translated Strings
            {
              // Show sort button only if data is populated, there's more than one sim, and stats are shown
              reportPopulated && listOfSims.length > 1 && showStats
              ? <SortButton onClick={() => handleSortButtonClick( SortKeyEnum.TOTAL_STRINGS )}/>
              : <></>
            }
          </th>
        </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
};

export default TranslationReportTable;