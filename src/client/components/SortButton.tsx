// Copyright 2022, University of Colorado Boulder

/**
 * Create a button with a sort icon.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';
import arrowUpDown from '../img/arrow-down-up.svg';

type SortButtonProps = {
  onClick: () => void;
};

/**
 * The sort button has an up-down arrow icon. It is used in the sortable table for the translation report.
 */
const SortButton: React.FC<SortButtonProps> = ( { onClick } ) => {
  const buttonStyle = {
    border: '0.5px solid',
    marginLeft: '6px'
  };
  return (
    <button style={buttonStyle} className='btn btn-light' onClick={onClick}>
      <img src={arrowUpDown} alt='up down arrow icon'/>
    </button>
  );
};

export default SortButton;