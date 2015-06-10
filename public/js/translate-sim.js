// Copyright 2002-2015, University of Colorado Boulder

/**
 * @author Michael Kauzmann and Aaron Davis on 6/10/2015.
 */

'use strict';


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



function saveButtonEL() {

  var inputs = $('input' );
  var strings = {};
  inputs.each(function(index, item){
    strings[item.name] = item.value;
  });

  $.post( '/translate/sim/save/' + simData.getAttribute( 'data-sim-name' ) + '/' + simData.getAttribute( 'data-locale-name' ),strings );


  saveButtonTop.style.backgroundColor = 'grey';
  saveButtonTop.style.borderColor = 'black';
  saveButtonTop.disabled = true;
  saveButtonBottom.style.backgroundColor = 'grey';
  saveButtonBottom.style.borderColor = 'black';
  saveButtonBottom.disabled = true;
  $('.savedSpan' ).attr( 'style' , 'visibility: visible');
}
saveButtonTop.addEventListener( 'click', saveButtonEL );
saveButtonBottom.addEventListener( 'click', saveButtonEL );



function restoreButton( button){
  button.style.backgroundColor = '#2a326a';
  button.style.borderColor = '#1A87B9';
  button.disabled=false;

}
function inputEL(){
  restoreButton(saveButtonTop);
  restoreButton(saveButtonBottom);
  $('.savedSpan' ).attr( 'style' , 'visibility: hidden');

}
var inputs = $('input' );
inputs.each(function(index, item){
  item.addEventListener('keydown', inputEL);
});
