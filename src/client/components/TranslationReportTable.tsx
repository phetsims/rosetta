// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that contains a sortable table of translated sims and their string statistics.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement, useContext, useState } from 'react';
import useTranslatedAndUntranslatedSims from '../hooks/useTranslatedAndUntranslatedSims';
import useTranslationReportObjects from '../hooks/useTranslationReportObjects';
import SortDirectionEnum from '../js/SortDirectionEnum';
import SortKeyEnum from '../js/SortKeyEnum';
import getTranslationReportRows from '../jsx/getTranslationReportRows';
import LoadingSpinner from './LoadingSpinner';
import NoStatsBanner from './NoStatsBanner';
import { SimNamesAndTitlesContext } from './RosettaRoutes';
import SortButton from './SortButton';

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
  const { reportPopulated, reportObjects } = useTranslationReportObjects(
    locale,
    wantsUntranslated,
    showStats
  );

  // State variables used in sorting the table.
  const [ sortKeys, setSortKeys ] = useState( SortKeyEnum.SIM_TITLE );
  const [ sortDirection, setSortDirection ] = useState( SortDirectionEnum.ASCENDING );

  const translatedAndUntranslatedSims = useTranslatedAndUntranslatedSims( locale );

  // Get JSX rows to populate the table.
  let jsx: ReactElement = <></>;
  if ( translatedAndUntranslatedSims !== null ) {
    const listOfSims = wantsUntranslated
                       ? translatedAndUntranslatedSims.untranslated
                       : translatedAndUntranslatedSims.translated;

    const reportRows = getTranslationReportRows(
      simNamesAndTitles,
      listOfSims,
      reportObjects,
      locale,
      reportPopulated,
      sortKeys,
      sortDirection,
      showStats
    );

    const handleSortButtonClick = ( newSortKeys: string[] ): void => {
      setSortKeys( newSortKeys );
      if ( sortDirection === SortDirectionEnum.ASCENDING ) {
        setSortDirection( SortDirectionEnum.DESCENDING );
      }
      else {
        setSortDirection( SortDirectionEnum.ASCENDING );
      }
    };

    const allSimsTranslated = wantsUntranslated && reportRows.length === 0;
    const noSimsTranslated = !wantsUntranslated && reportRows.length === 0;
    let tableJsx: ReactElement;

    if ( allSimsTranslated ) {
      tableJsx = <p>All sims translated, check percentages.</p>;
    }
    else if ( noSimsTranslated ) {
      tableJsx = <p>No sims translated.</p>;
    }
    else {
      tableJsx = (
        <table className='table table-striped'>
          <thead>
          <tr>
            <th>Sim Title
              {
                reportPopulated && reportRows.length > 1
                ? <SortButton onClick={() => handleSortButtonClick( SortKeyEnum.SIM_TITLE )}/>
                : <></>
              }
            </th>
            <th>Translated Strings
              {
                reportPopulated && reportRows.length > 1
                ? <SortButton onClick={() => handleSortButtonClick( SortKeyEnum.TOTAL_STRINGS )}/>
                : <></>
              }
            </th>
          </tr>
          </thead>
          <tbody>{reportRows}</tbody>
        </table>
      );
    }

    jsx = (
      <div className='mt-4'>
        {showStats ? <></> : <NoStatsBanner/>}
        <h3>
          {
            wantsUntranslated
            ? `Sims not yet published in ${localeName} (${locale})`
            : `Sims published in ${localeName} (${locale})`
          }
        </h3>
        {reportPopulated || !showStats ? <></> : <p>Translation data loading... <LoadingSpinner/></p>}
        {tableJsx}
      </div>
    );
  }
  return jsx;
};

export default TranslationReportTable;