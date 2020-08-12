// Copyright 2018-2020, University of Colorado Boulder

/**
 * Client-side JavaScript that makes it so that a PhET team member can perform the tests specified on the test page.
 *
 * @author Aaron Davis
 * @author Liam Mulhall
 */

'use strict';

// Modules
// const nodeFetch = require('node-fetch');

// // TODO: Finish rewriting the old code below.
// document.addEventListener( "DOMContentLoaded", () => {
//
//   // Get all buttons on the page.
//   const buttons = document.getElementsByTagName( 'button' );
//
//   // Form the beginning of the runSpecificTest route.
//   const runSpecificTestUrl = window.location.href.replace( 'test', 'runSpecificTest' );
//   console.log(runSpecificTestUrl);
//
//   // Make it so that when a button is clicked, the test associated with the button is requested.
//   for ( const button of buttons ) {
//
//     // The button's ID should be the testID for the runSpecificTest route.
//     const testID = button.getAttribute( 'id' );
//     button.addEventListener( 'click', () => {
//
//       // TODO: Use node-fetch as in localeInfo.js line 39.
//       fetch( runSpecificTestUrl + testID )
//         .then( data => {
//           console.log( data );
//         } )
//         .catch( error => {
//           console.log( `Fetch for ${runSpecificTestUrl + testID} failed. Error: ${error}.` );
//         } );
//     } );
//   }
// } );

$( document ).ready( function() {

  // runTest is incorrect. It should be runSpecificTest. I think this is my fault.
  // (I think I renamed runTest to runSpecificTest and didn't realize it would cause this problem.)
  const runTestUrl = window.location.href.replace( 'test', 'runTest' ) + '/';

  // add a handler for each button that will make it so that clicking that button will request the associated test
  const buttons = document.getElementsByTagName( 'button' );
  for ( let i = 0; i < buttons.length; i++ ) {
    const button = buttons[ i ];
    ( function() {
      const id = button.getAttribute( 'id' );
      button.addEventListener( 'click', function() {
        $.get( runTestUrl + id, function( data ) {
          console.log( data );
        } );
      } );
    } )();
  }
} );