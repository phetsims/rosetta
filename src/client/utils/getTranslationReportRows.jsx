// Copyright 2022, University of Colorado Boulder

import { Link } from 'react-router-dom';

const getTranslationReportRows = ( reportObjects, locale ) => {
  const translationReportRows = [];
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
  }
  return translationReportRows;
};

export default getTranslationReportRows;