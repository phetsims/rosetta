// Copyright 2022, University of Colorado Boulder

import arrowUpDown from '../img/arrow-down-up.svg';

const SortButton = props => {
  const handleClick = () => {
    if ( props.reportPopulated ) {
      window.alert( 'Sort it!' );
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