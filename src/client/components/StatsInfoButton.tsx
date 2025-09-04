// Copyright 2022, University of Colorado Boulder

/**
 * Info button that displays statistics about the translation for a specific sim.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';
import { ReportObjectWithCalculatedPercentages } from '../ClientDataTypes.js';
import infoCircle from '../img/info-circle.svg';

type StatsInfoButtonProps = {
  reportObject: ReportObjectWithCalculatedPercentages;
};

const StatsInfoButton: React.FC<StatsInfoButtonProps> = ( { reportObject } ) => {

  // Create a string that summarizes the statistics for the sim.
  let statsString = `Statistics for ${reportObject.simTitle}:`;
  statsString += `\nSim-Specific Strings: ${reportObject.simSpecificPercent}% (${reportObject.numSimSpecificTranslatedStrings} of ${reportObject.numSimSpecificStrings})`;
  if ( reportObject.numSharedStrings > 0 ) {
    statsString += `\nShared Strings: ${reportObject.sharedPercent}% (${reportObject.numSharedTranslatedStrings} of ${reportObject.numSharedStrings})`;
  }
  statsString += `\nCommon Strings: ${reportObject.commonPercent}% (${reportObject.numCommonTranslatedStrings} of ${reportObject.numCommonStrings})`;

  const buttonStyle = {
    marginRight: '6px',
    fontSize: '16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    alignItems: 'center'    // Center items vertically
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