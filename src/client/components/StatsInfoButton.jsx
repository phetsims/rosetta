// Copyright 2022, University of Colorado Boulder

/**
 *
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import infoCircle from '../img/info-circle.svg';

const StatsInfoButton = ( { statsString } ) => {
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