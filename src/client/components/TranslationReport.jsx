// Copyright 2022, University of Colorado Boulder

/* eslint-disable indent */

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall
 */

import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import useTranslationReportObjects from '../hooks/useTranslationReportObjects.jsx';
import getTranslationReportRows from '../utils/getTranslationReportRows.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { LocaleInfoContext, SimNamesAndTitlesContext } from './RosettaRoutes.jsx';
import SortButton from './SortButton.jsx';
import clientConstants from '../utils/clientConstants.js';

/**
 * This component allows a user to see a translation report for a given locale (statistics about translations) and
 * allows them to navigate to any of the simulations to translate them.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReport = () => {

  // Get URL params. (Need locale from params.)
  const params = useParams();

  // Tell user what locale they are seeing the report for.
  const localeInfo = useContext( LocaleInfoContext );
  let localeName = 'Loading...';
  if ( Object.keys( localeInfo ).length > 0 ) {
    localeName = localeInfo[ params.locale ].name;
  }

  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );

  // If you want to only see a few rows of stats for debugging, set this variable.
  // WARNING: This should be set to null in production!
  const numberOfEvents = clientConstants.numberOfShortReportEvents;

  // Get report objects consisting of translation report data.
  const { reportPopulated, reportObjects } = useTranslationReportObjects( params.locale, numberOfEvents );

  // State variables used in sorting the table.
  const [ sortKey, setSortKey ] = useState( 'simTitle' );
  const [ sortDirection, setSortDirection ] = useState( 'ascending' );

  // Get JSX rows to populate the table.
  const reportRows = getTranslationReportRows(
    simNamesAndTitles,
    reportObjects,
    params.locale,
    reportPopulated,
    sortKey,
    sortDirection,
    numberOfEvents
  );

  return (
    <div>
      <h1>Translation Report</h1>
      <h2 className='text-muted'>Locale: {localeName}</h2>
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

export default TranslationReport;