// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that contains a sortable table of translated sims and their string statistics.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/* eslint-disable indent */

import { useContext, useState } from 'react';
import useTranslatedAndUntranslatedSims from '../hooks/useTranslatedAndUntranslatedSims.jsx';
import useTranslationReportObjects from '../hooks/useTranslationReportObjects.jsx';
import SortDirectionEnum from '../js/SortDirectionEnum.js';
import SortKeyEnum from '../js/SortKeyEnum.js';
import getTranslationReportRows from '../jsx/getTranslationReportRows.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { SimNamesAndTitlesContext } from './RosettaRoutes.jsx';
import SortButton from './SortButton.jsx';

/**
 * Return a sortable table used in the translation report. You can sort it by sim title,
 * percent of translated sim-specific strings, or percent of translated common strings.
 *
 * @param {string} locale - ISO 639-1 locale code, e.g. es for Spanish
 * @param {string} localeName - the English name of the locale, e.g. Spanish
 * @param {boolean} wantsUntranslated - whether the caller wants this table to have untranslated sims or translated sims
 * @returns {JSX.Element}
 */
const TranslationReportTable = ( { locale, localeName, wantsUntranslated } ) => {

  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );

  // Get report objects consisting of translation report data.
  const { reportPopulated, reportObjects } = useTranslationReportObjects(
    locale,
    wantsUntranslated
  );

  // State variables used in sorting the table.
  const [ sortKeys, setSortKeys ] = useState( SortKeyEnum.SIM_TITLE );
  const [ sortDirection, setSortDirection ] = useState( SortDirectionEnum.ASCENDING );

  const translatedAndUntranslatedSims = useTranslatedAndUntranslatedSims( locale );

  // Get JSX rows to populate the table.
  let jsx = <></>;
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
      sortDirection
    );

    const handleSortButtonClick = newSortKeys => {
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
    let tableJsx = (
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
    if ( allSimsTranslated ) {
      tableJsx = <p>All sims translated, check percentages.</p>;
    }
    else if ( noSimsTranslated ) {
      tableJsx = <p>No sims translated.</p>;
    }

    jsx = (
      <div className='mt-4'>
        <h3>
          {
            wantsUntranslated
            ? `Sims not yet published in ${localeName} (${locale})`
            : `Sims published in ${localeName} (${locale})`
          }
        </h3>
        {reportPopulated ? <></> : <p>Translation data loading... <LoadingSpinner/></p>}
        {tableJsx}
      </div>
    );
  }
  return jsx;
};

export default TranslationReportTable;