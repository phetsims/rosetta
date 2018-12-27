// Copyright 2018, University of Colorado Boulder

/**
 * JavaScript that implements the test harness behavior, which is used to debug and verify the PhET translation utility.
 * This code runs on the client and generally stimulates the server by sending URLs to it.
 */

'use strict';

$( document ).ready( function() {

  const runTestRUL = window.location.href.replace( 'test', 'runTest' ) + '/';

  // add a handler for each button that will make it so that clicking that button will request the associated test
  const buttons = document.getElementsByTagName( 'button' );
  for ( let i = 0; i < buttons.length; i++ ){
    const button = buttons[ i ];
    (function(){
      const id = button.getAttribute('id');
      button.addEventListener( 'click', function(){
        $.get( runTestRUL + id );
      } );
    })();
  }
} );