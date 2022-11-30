// Copyright 2022, University of Colorado Boulder

import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const getTranslationReportRows = ( simNamesAndTitles, reportObjects, locale ) => {
  const translationReportRows = [];
  let lastSimName = '';
  for ( const reportObject of reportObjects ) {
    const simSpecificPercent = Math.floor( ( reportObject.numSimSpecificTranslatedStrings / reportObject.numSimSpecificStrings ) * 100 );
    const commonPercent = Math.floor( ( reportObject.numCommonTranslatedStrings / reportObject.numCommonStrings ) * 100 );
    translationReportRows.push( (
      <tr key={reportObject.simName}>
        <td><Link to={`/translate/${locale}/${reportObject.simName}`}>{reportObject.simTitle}</Link></td>
        <td>{simSpecificPercent}% ({reportObject.numSimSpecificTranslatedStrings} of {reportObject.numSimSpecificStrings})</td>
        <td>{commonPercent}% ({reportObject.numCommonTranslatedStrings} of {reportObject.numCommonStrings})</td>
      </tr>
    ) );
    lastSimName = reportObject.simName;
  }

  const simNames = Object.keys( simNamesAndTitles );
  const indexOfLastSimName = simNames.indexOf( lastSimName );
  for ( let i = indexOfLastSimName; i < simNames.length; i++ ) {
    translationReportRows.push( (
      <tr key={simNames[ i ]}>
        <td><Link to={`/translate/${locale}/${simNames[ i ]}`}>{simNamesAndTitles[ simNames[ i ] ]}</Link></td>
        <td><LoadingSpinner/></td>
        <td><LoadingSpinner/></td>
      </tr>
    ) );
  }
  return translationReportRows;
};

export default getTranslationReportRows;