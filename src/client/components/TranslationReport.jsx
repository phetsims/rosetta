// Copyright 2022, University of Colorado Boulder

/**
 * We define the translation report for a given locale.
 *
 * @author Liam Mulhall
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import clientConstants from '../utils/clientConstants.js';

/**
 * This component allows a user to see a translation report for a given locale (statistics about translations, e.g.
 * number of strings translated, total number of strings, etc.) and allows them to navigate to any of the simulations
 * to translate them.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationReport = () => {

  // grab the query parameters for later use
  const params = useParams();

  const [ reportObjects, setReportObjects ] = useState( [] );
  const [ listening, setListening ] = useState( false );

  useEffect( () => {
    if ( !listening ) {
      const translationReportUrl = `${clientConstants.translationApiRoute}/translationReportEvents/${params.locale}`;
      const translationReportSource = new EventSource( translationReportUrl );
      translationReportSource.onmessage = event => {
        const parsedData = JSON.parse( event.data );
        setReportObjects( reportObjects => reportObjects.concat( parsedData ) );
      };
      setListening( true );
    }
  }, [ listening, reportObjects ] );

  return (
    <div>
      <h1>Translation Report</h1>
      <h2 className='text-muted'>Locale: {params.locale}</h2>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Sim Title</th>
            <th>Sim-Specific Strings</th>
            <th>Common Strings</th>
          </tr>
        </thead>
        <tbody>
          {
            reportObjects.map( ( reportObject, i ) =>

              // TODO: Change i to unique sim name.
              <tr key={i}>
                <td>insert sim name here</td>
                <td>insert percentage here {reportObject.numSimSpecificTranslatedStrings} of {reportObject.numSimSpecificStrings}</td>
                <td>insert percentage here {reportObject.numCommonTranslatedStrings} of {reportObject.numCommonStrings}</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
};

export default TranslationReport;