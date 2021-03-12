// Copyright 2018-2020, University of Colorado Boulder

/**
 * Client-side JavaScript that makes it so that a PhET team member can perform the tests specified on the test page.
 *
 * @author Aaron Davis
 * @author Liam Mulhall
 */

'use strict';

// TODO: Find a more elegant, permanent solution for this. It suppresses a lint error, and thus allows us to use fetch. See https://github.com/phetsims/chipper/issues/970.
/*global fetch:false*/

document.addEventListener( 'DOMContentLoaded', () => {

  // Get all buttons on the page.
  const buttons = document.getElementsByTagName( 'button' );

  // Form the beginning of the runSpecificTest route.
  const runSpecificTestUrl = window.location.href.replace( 'test', 'runSpecificTest' );
  console.log( `runSpecificTestUrl: ${runSpecificTestUrl}` );

  // Make it so that when a button is clicked, the test associated with the button is requested.
  for ( const button of buttons ) {

    // The button's ID should be the testID for the runSpecificTest route.
    const testID = button.getAttribute( 'id' );
    button.addEventListener( 'click', () => {
      const fullTestUrl = `${runSpecificTestUrl}/${testID}`;
      fetch( fullTestUrl )
        .then( data => {
          console.log( `fullTestUrl: ${fullTestUrl}` );
          console.log( data );
        } )
        .catch( error => {
          console.log( `Fetch for ${fullTestUrl} failed. Error: ${error}` );
        } );
    } );
  }
} );
