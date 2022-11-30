// Copyright 2022, University of Colorado Boulder

/* eslint-disable indent */

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall
 */

import { useContext, useMemo, useState } from 'react';
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
  const params = useParams();
  const localeInfo = useContext( LocaleInfoContext );
  let localeName = 'Loading...';
  if ( Object.keys( localeInfo ).length > 0 ) {
    localeName = localeInfo[ params.locale ].name;
  }
  const simNamesAndTitles = useContext( SimNamesAndTitlesContext );

  // WARNING: This should be set to null in production!
  const numberOfEvents = clientConstants.numberOfShortReportEvents;
  const { reportPopulated, reportObjects, setReportObjects } = useTranslationReportObjects( params.locale, numberOfEvents );
  const reportRows = getTranslationReportRows( simNamesAndTitles, reportObjects, params.locale, numberOfEvents );
  const [ sortConfig, setSortConfig ] = useState( null );
  const sortedReportObjects = useMemo( () => {
    const sortableReportObjects = [ ...reportObjects ];
    if ( sortConfig !== null ) {
      // eslint-disable-next-line no-debugger
      debugger;
      sortableReportObjects.sort( ( a, b ) => {
        if ( a[ sortConfig.columnName ] < b[ sortConfig.columnName ] ) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if ( a[ sortConfig.columnName ] > b[ sortConfig.columnName ] ) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      } );
    }
    return sortableReportObjects;
  }, [ reportObjects, sortConfig ] );
  const requestSort = columnName => {
    window.alert( `Sort ${columnName}!` );
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.columnName === columnName &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig( { columnName: columnName, direction: direction } );

    setReportObjects( sortedReportObjects );
  };
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
            {reportPopulated ? <SortButton onClick={() => { requestSort( 'simTitle' );}}/> : <></>}
          </th>
          <th>Sim-Specific Strings
            {reportPopulated ? <SortButton onClick={() => { requestSort( 'simSpecificPercent' );}}/> : <></>}
          </th>
          <th>Common Strings
            {reportPopulated ? <SortButton onClick={() => { requestSort( 'commonPercent' );}}/> : <></>}
          </th>
        </tr>
        </thead>
        <tbody>{reportRows}</tbody>
      </table>
    </div>
  );
};

export default TranslationReport;