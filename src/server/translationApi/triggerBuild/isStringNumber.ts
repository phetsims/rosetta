// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that tells whether a string is a string number.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Helper function. !isNaN is confusing, hence this function.
 */
const isStringNumber: ( stringToTest: string ) => boolean = ( stringToTest: string ) =>
  !isNaN( parseFloat( String( stringToTest ) ) ) && isFinite( Number( stringToTest ) );

export default isStringNumber;