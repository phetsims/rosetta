// Copyright 2023, University of Colorado Boulder

/**
 * Helper function that gets percent.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Get percentage given numerator and denominator.
 *
 * @param {Number} numerator
 * @param {Number} denominator
 * @returns {Number|null}
 */
const getPercent = ( numerator, denominator ) => {
  let percent = null;
  if ( numerator !== null && denominator !== null ) {
    percent = Math.floor( ( numerator / denominator ) * 100 );
  }
  return percent;
};

export default getPercent;