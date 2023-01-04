// Copyright 2022, University of Colorado Boulder

/**
 *
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import infoCircle from '../img/info-circle.svg';

const StatsInfoButton = ( { reportObject } ) => {
  const hasSharedStrings = reportObject.numSharedStrings !== null;
  let sharedStatsString = 'N/A';
  if ( hasSharedStrings ) {
    sharedStatsString = `${reportObject.percentShared}% (${reportObject.numSharedTranslatedStrings} of ${reportObject.numSharedStrings})`;
  }
  const simSpecificStatsString = `${reportObject.percentSimSpecific}% (${reportObject.numSimSpecificTranslatedStrings} of ${reportObject.numSimSpecificStrings})`;
  const commonStatsString = `${reportObject.percentCommon}% (${reportObject.numCommonTranslatedStrings} of ${reportObject.numCommonStrings})`;
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