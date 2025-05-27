// Copyright 2022, University of Colorado Boulder

/**
 * Info button that displays statistics about the translation for a specific sim.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';
import { ReportObjectWithCalculatedPercentages } from '../clientTypes';
import infoCircle from '../img/info-circle.svg';

type StatsInfoButtonProps = {
  reportObject: ReportObjectWithCalculatedPercentages;
};

const StatsInfoButton: React.FC<StatsInfoButtonProps> = ( { reportObject } ) => {
  const hasSharedStrings = reportObject.numSharedStrings !== null;
  let sharedStatsString = 'N/A';
  if ( hasSharedStrings ) {
    sharedStatsString = `${reportObject.sharedPercent}% (${reportObject.numSharedTranslatedStrings} of ${reportObject.numSharedStrings})`;
  }
  const simSpecificStatsString = `${reportObject.simSpecificPercent}% (${reportObject.numSimSpecificTranslatedStrings} of ${reportObject.numSimSpecificStrings})`;
  const commonStatsString = `${reportObject.commonPercent}% (${reportObject.numCommonTranslatedStrings} of ${reportObject.numCommonStrings})`;
  const statsString = `Statistics for ${reportObject.simTitle}:
      Sim-Specific Strings: ${simSpecificStatsString}
      Shared Strings: ${sharedStatsString}
      Common Strings: ${commonStatsString}`;
  const buttonStyle = {
    marginRight: '6px',
    padding: '0'
  };
  return (
    <button
      onClick={() => window.alert( statsString )}
      style={buttonStyle}
      type='button'
      className='btn btn-light'
      data-bs-toggle='tooltip'
      data-bs-placement='top'
      title={statsString}>
      <img src={infoCircle} alt='info icon'/>
    </button>
  );
};

export default StatsInfoButton;