// Copyright 2020, University of Colorado Boulder

/**
 * Client-side JavaScript that gives translate-sim.html its functionality.
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// constants
// const SINGLE_BRACE_PATTERN_REGULAR_EXP = /\{\d+\}/g;
// const DOUBLE_BRACE_PATTERN_REGULAR_EXP = /\{\{\w+\}\}/g;

//===========================================================================//
// Define functions for use once the DOM is loaded.                          //
//===========================================================================//

function testTranslation() {
  console.log( 'Hello, world!' );
}

function saveTranslation() {
  console.log( 'Hello, world!' );
}

//===========================================================================//
// Add functionality once the DOM has been loaded.                           //
//===========================================================================//

document.addEventListener( 'DOMContentLoaded', () => {

  // Create a list of the top and bottom test buttons.
  const testButtonsList = document.getElementsByClassName( 'test-btn' );

  // Create a list of the top and bottom save buttons.
  const saveButtonsList = document.getElementsByClassName( 'save-btn' );

  // Add event listeners for the test buttons.
  for ( const testButton of testButtonsList ) {
    testButton.addEventListener( 'click', testTranslation );
  }

  // Add event listeners for the save buttons.
  for ( const saveButton of saveButtonsList ) {
    saveButton.addEventListener( 'click', saveTranslation );
  }
} );