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

function testButtonEL() {
  var simUrl = simData.getAttribute( 'data-sim-url' );
  var stringPrefix = simData.getAttribute( 'data-sim-name' ).replace( /-/g, '_' ).toUpperCase();
  var stringsToReplace = {};
  var table = document.getElementById( 'stringsTable' );
  for ( var i = 1, row; row = table.rows[ i ]; i++ ) {
    var translation = row.cells[ 1 ].children[ 0 ].value;
    if ( translation.length > 0 ) {
      stringsToReplace[ stringPrefix + '/' + row.getAttribute( 'data-string-key' ) ] = translation;
    }
  }
  var win = window.open( simUrl + '?' + 'strings=' + encodeURIComponent( JSON.stringify( stringsToReplace ) ), '_blank' );
  win.focus();
}
testButtonTop.addEventListener( 'click', testButtonEL );
testButtonBottom.addEventListener( 'click', testButtonEL );

// Var to help only restore save button once from inputs
var once = false;

var inputs = $( 'input' );
var savedSpans = $( '.savedSpan' );

function saveButtonEL() {

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

saveButtonTop.addEventListener( 'click', saveButtonEL );
saveButtonBottom.addEventListener( 'click', saveButtonEL );

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

function inputEL() {
  if ( !once ) {
    $( '.savedSpan' ).attr( 'style', 'visibility: hidden' );
    restoreButton( saveButtonTop );
    restoreButton( saveButtonBottom );

    once = true;
  }
}

inputs.each( function( index, item ) {
  item.addEventListener( 'keydown', inputEL );
} );

if ( simData.getAttribute( 'data-direction' ) === 'rtl' ) {
  inputs.attr( 'dir', 'rtl' );
  inputs.css( 'text-align', 'right' );
}