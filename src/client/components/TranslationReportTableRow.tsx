// Copyright 2025, University of Colorado Boulder

/**
 * A row of the Translation Report
 *
 * @author Agustín Vallejo + Gemini 2.5
 */

import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import ReportObject from '../../common/ReportObject.js';
import StatsInfoButton from './StatsInfoButton';

type TranslationReportTableRowProps = {
  item: ReportObject;
  locale: string;
};

const tdStyle = {
  width: '30%'
};

const TranslationReportTableRow: React.FC<TranslationReportTableRowProps> = ( { item, locale } ): ReactElement => {
  let pendingUpdateMessage: ReactElement = <></>;
  if ( item.isDirty ) {
    pendingUpdateMessage = <> (pending update)</>;
  }

  return (
    <tr key={item.simName}>
      <td style={tdStyle}><Link to={`/translate/${locale}/${item.simName}`}>{item.simTitle}</Link>{pendingUpdateMessage}</td>
      <td style={tdStyle}>
        <StatsInfoButton reportObject={item}/>
        {item.totalPercent}% ({item.totalTranslatedStrings} of {item.totalStrings})
      </td>
    </tr>
  );
};

export default TranslationReportTableRow;