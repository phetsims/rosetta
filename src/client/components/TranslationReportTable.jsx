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
import clientConstants from '../utils/clientConstants.js';
import getTranslationReportRows from '../utils/getTranslationReportRows.jsx';
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

  // If you want to only see a few rows of stats for debugging, set this variable.
  // WARNING: This should be set to null in production!
  const numberOfEvents = clientConstants.numberOfShortReportEvents;

  // Get report objects consisting of translation report data.
  const { reportPopulated, reportObjects } = useTranslationReportObjects(
    locale,
    wantsUntranslated,
    numberOfEvents
  );

  // State variables used in sorting the table.
  const [ sortKey, setSortKey ] = useState( 'simTitle' );
  const [ sortDirection, setSortDirection ] = useState( 'ascending' );

  const translatedAndUntranslatedSims = useTranslatedAndUntranslatedSims( locale );

  // Get JSX rows to populate the table.
  let jsx = <p>Loading...</p>;
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
      sortKey,
      sortDirection,
      numberOfEvents
    );

    const handleSortButtonClick = newSortKey => {
      setSortKey( newSortKey );
      if ( sortDirection === 'ascending' ) {
        setSortDirection( 'descending' );
      }
      else {
        setSortDirection( 'ascending' );
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
              ? <SortButton onClick={() => handleSortButtonClick( 'simTitle' )}/>
              : <></>
            }
          </th>
          <th>Sim-Specific Strings
            {
              reportPopulated && reportRows.length > 1
              ? <SortButton onClick={() => handleSortButtonClick( 'simSpecificPercent' )}/>
              : <></>
            }
          </th>
          <th>Common Strings
            {
              reportPopulated && reportRows.length > 1
              ? <SortButton onClick={() => handleSortButtonClick( 'commonPercent' )}/>
              : <></>
            }
          </th>
        </tr>
        </thead>
        <tbody>{reportRows}</tbody>
      </table>
    );
    if ( allSimsTranslated ) {
      tableJsx = <p>All sims translated.</p>;
    }
    else if ( noSimsTranslated ) {
      tableJsx = <p>No sims translated.</p>;
    }

    jsx = (
      <div className='mt-4'>
        <h3>
          {
            wantsUntranslated
            ? `Sims not yet translated into ${localeName} (${locale})`
            : `Sims translated into ${localeName} (${locale})`
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