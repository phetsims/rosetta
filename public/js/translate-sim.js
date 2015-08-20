// Copyright 2002-2015, University of Colorado Boulder

/**
 * Created 6/10/15
 * @author Michael Kauzmann
 * @author Aaron Davis
 */
var testButtonTop = document.getElementById( 'testButtonTop' );
var saveButtonTop = document.getElementById( 'saveButtonTop' );
var testButtonBottom = document.getElementById( 'testButtonBottom' );
var saveButtonBottom = document.getElementById( 'saveButtonBottom' );
var simData = document.getElementById( 'simData' );
var rtl = simData.getAttribute( 'data-direction' ) === 'rtl';

function testButtonEventListener() {
  var simUrl = simData.getAttribute( 'data-sim-url' );
  var stringsToReplace = {};
  var rows = document.getElementsByTagName( 'TR' );
  for ( var i = 1, row; row = rows[ i ]; i++ ) {
    var translation = row.cells[ 1 ].children[ 0 ].value;
    if ( translation && translation.length > 0 ) {
      // add rtl embedding markers for rtl strings
      if ( rtl ) {
        translation = '%E2%80%AB' + translation + '%E2%80%AC';
      }
      var stringKey = row.getAttribute( 'data-string-repo' ).replace( /-/g, '_' ).toUpperCase() + '/' + row.getAttribute( 'data-string-key' );
      console.log( stringKey );
      stringsToReplace[ stringKey ] = translation;
    }
  }
  var encodedStrings = encodeURIComponent( JSON.stringify( stringsToReplace ) );
  encodedStrings = encodedStrings.replace( /%5C%5Cn/g, '%5Cn' ); // put back newlines

  var win = window.open( simUrl + '?' + 'strings=' + encodedStrings, '_blank' );
  win.focus();
}

testButtonTop.addEventListener( 'click', testButtonEventListener );
testButtonBottom.addEventListener( 'click', testButtonEventListener );

// Var to help only restore save button once from inputs
var once = false;

var inputs = $( 'input' );
var savedSpans = $( '.savedSpan' );

function saveButtonEventListener() {
  var strings = {};
  inputs.each( function( index, item ) {
    strings[ item.name ] = item.value;
  } );

  $.post( '/translate/sim/save/' + simData.getAttribute( 'data-sim-name' ) + '/' + simData.getAttribute( 'data-locale-name' ), strings, function( data ) {
    $( '.saving-gif' ).hide();

    if ( data.success ) {
      // grey out both save buttons, add saved below
      saveButtonTop.style.backgroundColor = 'grey';
      saveButtonTop.style.borderColor = 'black';
      saveButtonTop.disabled = true;
      saveButtonBottom.style.backgroundColor = 'grey';
      saveButtonBottom.style.borderColor = 'black';
      saveButtonBottom.disabled = true;
      savedSpans.attr( 'style', 'visibility: visible; color: green;' );
      savedSpans.html( '<br><br>Saved' );
      once = false;
    }
    else {
      savedSpans.attr( 'style', 'visibility: visible; color: red;' );
      savedSpans.html( '<br><br>Error Saving' );
    }
  } );
  $( '.saving-gif' ).show();
}

saveButtonTop.addEventListener( 'click', saveButtonEventListener );
saveButtonBottom.addEventListener( 'click', saveButtonEventListener );

/**
 * Restore a button to its original (non-greyed out) state
 * @param button
 */
function restoreButton( button ) {
  button.style.backgroundColor = '#2a326a';
  button.style.borderColor = '#1A87B9';
  button.disabled = false;
  $( '#' + button.id ).hover( function() {
      $( this ).css( {
        background: '#6D77BD'
      } );
    },
    function() {
      $( this ).css( {
        background: '#2a326a'
      } );
    } );
}

/**
 * remove "saved" text when any change is made to inputs
 */
function inputEventListener() {
  if ( !once ) {
    $( '.savedSpan' ).attr( 'style', 'visibility: hidden' );
    restoreButton( saveButtonTop );
    restoreButton( saveButtonBottom );
    once = true;
  }
}

inputs.each( function( index, item ) {
  item.addEventListener( 'keydown', inputEventListener );
} );

// add red highlight to "\n" so users are aware that this is treated specially
$( 'td:contains("\\\\n")' ).each( function( i, e ) {
  $( e ).html( $( e ).text().replace( '\\n', '<span style="color: red">\\n</span>' ) );
} );

// fix dir and text-align for rtl languages
if ( rtl ) {
  inputs.attr( 'dir', 'rtl' );
  inputs.css( 'text-align', 'right' );
}
