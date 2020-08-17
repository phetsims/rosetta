// Copyright 2018-2020, University of Colorado Boulder

/**
 * Client-side JavaScript that makes it so that a PhET team member can perform the tests specified on the test page.
 *
 * @author Aaron Davis
 * @author Liam Mulhall
 */

'use strict';

/*global fetch:false*/

// TODO: Finish rewriting the old code below.
document.addEventListener( 'DOMContentLoaded', () => {

  // Get all buttons on the page.
  const buttons = document.getElementsByTagName( 'button' );

  // Form the beginning of the runSpecificTest route.
  const runSpecificTestUrl = window.location.href.replace( 'test', 'runSpecificTest' );
  console.log(runSpecificTestUrl);

  // Make it so that when a button is clicked, the test associated with the button is requested.
  for ( const button of buttons ) {

    // The button's ID should be the testID for the runSpecificTest route.
    const testID = button.getAttribute( 'id' );
    button.addEventListener( 'click', () => {

      // It seems I can't use fetch (basically new and improved XHR) because Grunt complains about it.
      // I can't use node-fetch because the browser complains about it. (Require isn't defined.)
      // I'd like to be able to use fetch, but I might try using XMLHttpRequest instead.
      const fullTestUrl = runSpecificTestUrl + '/' + testID;
      fetch( fullTestUrl )
        .then( data => {
          console.log( `URL: ${fullTestUrl}.` );
          console.log( data );
        } )
        .catch( error => {
          console.log( `Fetch for ${fullTestUrl} failed. Error: ${error}.` );
        } );
    } );
  }
} );
