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
// Define helper functions.                                                  //
//===========================================================================//

// function rowIsValid() {
//   console.log( 'Hello, rowIsValid!' );
// }
//
// function patternsAreValid() {
//   console.log( 'Hello, patternsAreValid!' );
// }

//===========================================================================//
// Define functions for use once the DOM is loaded.                          //
//===========================================================================//

function testTranslation() {
  console.log( 'Hello, testTranslation!' );
}

function saveTranslation() {
  console.log( 'Hello, saveTranslation!' );
}

//===========================================================================//
// Add functionality once the DOM has been loaded.                           //
//===========================================================================//

document.addEventListener( 'DOMContentLoaded', () => {

  // Create lists of buttons.
  const testButtonsList = document.getElementsByClassName( 'test-btn' );
  const saveButtonsList = document.getElementsByClassName( 'save-btn' );

  // Add functionality for the test buttons.
  for ( const testButton of testButtonsList ) {
    testButton.addEventListener( 'click', testTranslation );
  }

  // Add functionality for the save buttons.
  for ( const saveButton of saveButtonsList ) {
    saveButton.addEventListener( 'click', saveTranslation );
  }

  // Create a list of the user inputs.
  const userInputsSelector = '.string-translation-table div[contenteditable]';
  const userInputsList = document.querySelectorAll( userInputsSelector );

  // Get the sim data.
  const simData = document.getElementById( 'simData' );

  // Set a boolean for whether the data direction is right-to-left.
  const dataDirectionIsRtl = simData.getAttribute( 'data-direction' ) === 'rtl';

  // Change the direction of the text if the data direction is right-to-left.
  if ( dataDirectionIsRtl ) {
    for ( const userInput of userInputsList ) {
      userInput.setAttribute( 'dir', 'rtl' );
      userInput.style.textAlign = 'right';
    }
  }
} );