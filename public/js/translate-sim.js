// Copyright 2002-2015, University of Colorado Boulder

/**
 * @author Michael Kauzmann and Aaron Davis on 6/10/2015.
 */

'use strict';


var testButton1 = document.getElementById( 'testButton1' );
var saveButton1 = document.getElementById( 'saveButton1' );
var testButton2 = document.getElementById( 'testButton2' );
var saveButton2 = document.getElementById( 'saveButton2' );
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
testButton1.addEventListener( 'click', testButtonEL );
testButton2.addEventListener( 'click', testButtonEL );



function saveButtonEL() {

  var inputs = $('input' );
  var strings = {};
  inputs.each(function(index, item){
    strings[item.name] = item.value;
  });

  $.post( '/translate/sim/save/' + simData.getAttribute( 'data-sim-name' ) + '/' + simData.getAttribute( 'data-locale-name' ),strings );

  saveButton1.style.backgroundColor = 'grey';
  saveButton1.style.borderColor = 'black';
  saveButton2.style.backgroundColor = 'grey';
  saveButton2.style.borderColor = 'black';

}
saveButton1.addEventListener( 'click', saveButtonEL );
saveButton2.addEventListener( 'click', saveButtonEL );


function inputEL(){
  saveButton1.style.backgroundColor = '#2a326a';
  saveButton1.style.borderColor = '#1A87B9';
  saveButton2.style.backgroundColor = '#2a326a';
  saveButton2.style.borderColor = '#1A87B9';
}
var inputs = $('input' );
inputs.each(function(index, item){
  item.addEventListener('keydown', inputEL);
});
