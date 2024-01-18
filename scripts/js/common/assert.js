// Copyright 2023, University of Colorado Boulder

/**
 * Basic assert function for use in scripts, used to test a condition and abort if the condition isn't true.  This
 * was modeled after the assert function that PhET uses in sim development.
 *
 * @author John Blanco (PhET Interactive Simulations)
 *
 * @param {boolean} condition
 * @param {string} message
 */
module.exports = function assert( condition, message ) {
  if ( !condition ) {
    console.error( `assert failed: ${message}` );
    process.exit( 1 );
  }
};