// Copyright 2022, University of Colorado Boulder

import arrowUpDown from '../img/arrow-down-up.svg';

const SortButton = ( { reportPopulated } ) => {
  const handleClick = () => {
    if ( reportPopulated ) {
      window.alert( 'Sort it, dude!' );
    }
    else {
      window.alert( 'Please wait until the report is populated before sorting a column.' );
    }
  };
  return (
    <button className='btn btn-light' onClick={handleClick}>
      <img src={arrowUpDown} alt='up down arrow icon'/>
    </button>
  );
};

export default SortButton;