// Copyright 2022, University of Colorado Boulder

/**
 * Create a button with a sort icon.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import arrowUpDown from '../img/arrow-down-up.svg';

/**
 * The sort button has an up-down arrow icon. It is used in the sortable table for the translation report.
 *
 * @param props
 * @returns {JSX.Element}
 */
const SortButton = props => {
  const buttonStyle = {
    border: '0.5px solid',
    marginLeft: '6px'
  };
  return (
    <button style={buttonStyle} className='btn btn-light' onClick={props.onClick}>
      <img src={arrowUpDown} alt='up down arrow icon'/>
    </button>
  );
};

export default SortButton;