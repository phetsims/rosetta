// Copyright 2022, University of Colorado Boulder

/**
 * Create a button with a sort icon.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import arrowUpDown from '../img/arrow-down-up.svg';

/**
 * The sort button has an up-down arrow icon.
 *
 * @param props
 * @returns {JSX.Element}
 */
const SortButton = props => {
  return (
    <button className='btn btn-light' onClick={props.onClick}>
      <img src={arrowUpDown} alt='up down arrow icon'/>
    </button>
  );
};

export default SortButton;