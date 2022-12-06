// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that contains a sortable table of translated sims and their string statistics.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/* eslint-disable indent */

import { useContext, useState } from 'react';
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
 * @param locale - ISO 639-1 locale code, e.g. es for Spanish
 * @param localeName - the English name of the locale, e.g. Spanish
 * @returns {JSX.Element}
 */
const TranslatedSimsTable = ( { locale, localeName } ) => {

  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );

  // If you want to only see a few rows of stats for debugging, set this variable.
  // WARNING: This should be set to null in production!
  const numberOfEvents = clientConstants.numberOfShortReportEvents;

  // Get report objects consisting of translation report data.
  const { reportPopulated, reportObjects } = useTranslationReportObjects( locale, numberOfEvents );

  // State variables used in sorting the table.
  const [ sortKey, setSortKey ] = useState( 'simTitle' );
  const [ sortDirection, setSortDirection ] = useState( 'ascending' );

  // Get JSX rows to populate the table.
  const reportRows = getTranslationReportRows(
    simNamesAndTitles,
    reportObjects,
    locale,
    reportPopulated,
    sortKey,
    sortDirection,
    numberOfEvents
  );

  return (
    <div>
      {reportPopulated
       ? <p>The translation report is finished!</p>
       : <><p>The translation report is being populated...</p><LoadingSpinner/></>}
      <table className='table table-striped'>
        <thead>
        <tr>
          <th>Sim Title
            {
              reportPopulated
              ? <SortButton onClick={() => {
                setSortKey( 'simTitle' );
                if ( sortDirection === 'ascending' ) {
                  setSortDirection( 'descending' );
                }
                else {
                  setSortDirection( 'ascending' );
                }
              }}/>
              : <></>
            }
          </th>
          <th>Sim-Specific Strings
            {
              reportPopulated
              ? <SortButton onClick={() => {
                setSortKey( 'simSpecificPercent' );
                if ( sortDirection === 'ascending' ) {
                  setSortDirection( 'descending' );
                }
                else {
                  setSortDirection( 'ascending' );
                }
              }}/>
              : <></>
            }
          </th>
          <th>Common Strings
            {
              reportPopulated
              ? <SortButton onClick={() => {
                setSortKey( 'commonPercent' );
                if ( sortDirection === 'ascending' ) {
                  setSortDirection( 'descending' );
                }
                else {
                  setSortDirection( 'ascending' );
                }
              }}/>
              : <></>
            }
          </th>
        </tr>
        </thead>
        <tbody>{reportRows}</tbody>
      </table>
    </div>
  );
};

export default TranslatedSimsTable;