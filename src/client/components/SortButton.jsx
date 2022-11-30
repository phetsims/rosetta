// Copyright 2022, University of Colorado Boulder

import arrowUpDown from '../img/arrow-down-up.svg';

const SortButton = props => {
  return (
    <button className='btn btn-light' onClick={props.onClick}>
      <img src={arrowUpDown} alt='up down arrow icon'/>
    </button>
  );
};

export default SortButton;