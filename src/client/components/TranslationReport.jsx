// Copyright 2022, University of Colorado Boulder

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import clientConstants from '../utils/clientConstants.js';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * This component allows a user to see a translation report for a given locale (statistics about translations) and
 * allows them to navigate to any of the simulations to translate them.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReport = () => {

  const params = useParams();

  const [ listening, setListening ] = useState( false );
  const [ reportPopulated, setReportPopulated ] = useState( false );
  const [ reportObjects, setReportObjects ] = useState( [] );

  useEffect( () => {
    if ( !listening && !reportPopulated ) {
      const translationReportUrl = `${clientConstants.translationApiRoute}/translationReportEvents/${params.locale}`;
      const translationReportSource = new EventSource( translationReportUrl );
      translationReportSource.onmessage = event => {
        if ( event.data !== 'closed' ) {
          const parsedData = JSON.parse( event.data );
          setReportObjects( reportObjects => reportObjects.concat( parsedData ) );
        }
        else {
          setReportPopulated( true );
        }
      };
      setListening( true );
    }
  }, [ listening, reportPopulated, reportObjects ] );


  const reportRows = [];
  for ( const reportObject of reportObjects ) {
    const simSpecificPercent = Math.floor( ( reportObject.numSimSpecificTranslatedStrings / reportObject.numSimSpecificStrings ) * 100 );
    const commonPercent = Math.floor( ( reportObject.numCommonTranslatedStrings / reportObject.numCommonStrings ) * 100 );
    reportRows.push( (
      <tr key={reportObject.simName}>
        <td><Link to={`/translate/${params.locale}/${reportObject.simName}`}>{reportObject.simTitle}</Link></td>
        <td>{simSpecificPercent}% ({reportObject.numSimSpecificTranslatedStrings} of {reportObject.numSimSpecificStrings})</td>
        <td>{commonPercent}% ({reportObject.numCommonTranslatedStrings} of {reportObject.numCommonStrings})</td>
      </tr>
    ) );
  }

  return (
    <div>
      <h1>Translation Report</h1>
      <h2 className='text-muted'>Locale: {params.locale}</h2>
      {reportPopulated
       ? <p>The translation report is finished!</p>
       : <><p>The translation report is being populated...</p><LoadingSpinner/></>}
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Sim Title</th>
            <th>Sim-Specific Strings</th>
            <th>Common Strings</th>
          </tr>
        </thead>
        <tbody>{reportRows}</tbody>
      </table>
    </div>
  );
};

export default TranslationReport;