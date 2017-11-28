// Copyright 2017, University of Colorado Boulder

/**
 * JavaScript that implements the test harness behavior, which is used to debug and verify the PhET translation utility.
 * This code runs on the client and generally stimulates the server by sending URLs to it.
 */

/* eslint-env node */
'use strict';

$( document ).ready( function() {

  var runTestRUL = window.location.href.replace( 'test', 'runTest' ) + '/';

  // add a handler for each button that will make it so that clicking that button will request the associated test
  var buttons = document.getElementsByTagName( 'button' );
  for ( var i = 0; i < buttons.length; i++ ){
    var button = buttons[ i ];
    (function(){
      var id = button.getAttribute('id');
      button.addEventListener( 'click', function(){
        console.log( 'would hit URL: ', runTestRUL + id );
        $.get( runTestRUL + id );
      } );
    })();
  }
} );