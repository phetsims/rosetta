// Copyright 2023, University of Colorado Boulder

/**
 * Helper function that calculates total strings.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Given an array of numbers, return the sum. Disregard values if they are null.
 *
 * @paramvalues
 * @returns - Sum of all values in the array, disregarding null values.
 */
const getTotalStrings = ( values: ( number | null )[] ): number => {
  let total = 0;
  for ( const value of values ) {
    if ( value === null ) {
      total += 0;
    }
    else {
      total += value;
    }
  }
  return total;
};

export default getTotalStrings;