// Copyright 2002-2015, University of Colorado Boulder

/**
 * Javascript for translate-sim.html
 * @author Michael Kauzmann
 * @author Aaron Davis
 * @author John Blanco
 */
/* eslint-env node */
'use strict';

// varants
var SINGLE_BRACE_PATTERN_REGULAR_EXP = /\{\d+\}/g;
var DOUBLE_BRACE_PATTERN_REGULAR_EXP = /\{\{\w+\}\}/g;

/**
 * Modified from http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
 * @param contentEditableElement
 */
function setEndOfContentEditable( contentEditableElement ) {

  var range;

  // Firefox, Chrome, Opera, Safari, IE 9+
  if ( document.createRange ) {
    range = document.createRange();
    range.selectNodeContents( contentEditableElement );

    // uncomment the following line to move the cursor to the end of the input instead of selecting all
    // range.collapse( false );
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange( range );
  }

  // IE 8 and lower
  else if ( document.selection ) {
    range = document.body.createTextRange();
    range.moveToElementText( contentEditableElement );

    // uncomment the following line to move the cursor to the end of the input instead of selecting all
    // range.collapse( false );
    range.select();
  }
}

$( document ).ready( function() {

  var testButtonTop = document.getElementById( 'testButtonTop' );
  var saveButtonTop = document.getElementById( 'saveButtonTop' );
  var testButtonBottom = document.getElementById( 'testButtonBottom' );
  var saveButtonBottom = document.getElementById( 'saveButtonBottom' );
  var simData = document.getElementById( 'simData' );
  var rtl = simData.getAttribute( 'data-direction' ) === 'rtl';
  var savedSpans = $( '.savedSpan' );

  // flag to help only restore save button once from inputs
  var once = false;

  // selector for content-editable divs (where the user input goes)
  var inputSelector = '.string-translation-table div[contenteditable]';
  var inputs = $( inputSelector );

  /**
   * Copy all of the content-editable text into the hidden inputs to be submitted
   */
  function syncInputs() {
    inputs.each( function( index, element ) {
      var contentEditable = $( element );
      var input = contentEditable.next().get( 0 );
      input.value = contentEditable.text();
    } );
  }

  /**
   * handler that will test the strings currently shown in the
   */
  function testTranslationNew() {

    // NOTE TO FUTURE MAINTAINERS: I (jbphet) tried using jQuery's post method for the post performed below, but it
    // triggered my popup blocker.  The approach used below, which creates a temporory form element and submits it,
    // didn't trigger the popup blocker, so I went with it.

    // create the URL for the post request
    var testTranslationURL = window.location.origin + '/translate/sim/test/' + simData.getAttribute( 'data-sim-name' );

    // create a form whose response will appear in a new window
    var translatedStringsForm = document.createElement( 'form' );
    translatedStringsForm.target = '_blank';
    translatedStringsForm.method = 'POST';
    translatedStringsForm.action = testTranslationURL;

    // fill in the fields of this new form with the data from the main strings form
    var inputs = $( '.string-translation-table tr' );
    inputs.each( function( i, row ) {
      var contentEditable = $( $( row ).find( 'div[contenteditable]' ).get( 0 ) );
      if ( contentEditable ) {
        var translation = contentEditable.text();
        var repo = row.getAttribute( 'data-string-repo' );
        if ( repo && translation && translation.length > 0 ) {

          // add RTL embedding markers for RTL strings
          if ( rtl ) {
            translation = '\u202b' + translation + '\u202c';
          }
          else {
            translation = '\u202a' + translation + '\u202c';
          }

          // create an input field for the translated string
          var input = document.createElement( 'input' );
          input.type = 'text';
          input.name = repo.replace( /-/g, '_' ).toUpperCase() + '/' + row.getAttribute( 'data-string-key' );
          input.value = translation;
          translatedStringsForm.appendChild( input );
        }
      }
    } );

    // add the form to DOM
    document.body.appendChild( translatedStringsForm );

    // submit
    translatedStringsForm.submit();

    // remove the form now that it has been submitted
    document.body.removeChild( translatedStringsForm );
  }

  /**
   * Handler for the "Test" button on the translate page.  This creates a URL with a query parameter that contains all
   * of the translated strings and opens the sim with them so that the user can see how the translation looks.
   */
  function testTranslation() {
    var simUrl = simData.getAttribute( 'data-sim-url' );
    var inputs = $( '.string-translation-table tr' );

    // go through the table of translated strings and populate an object with strings that should be replaced in the sim
    var stringsToReplace = {};
    inputs.each( function( i, row ) {
      var contentEditable = $( $( row ).find( 'div[contenteditable]' ).get( 0 ) );
      if ( contentEditable ) {
        var translation = contentEditable.text();
        var repo = row.getAttribute( 'data-string-repo' );
        if ( repo && translation && translation.length > 0 ) {

          // add RTL embedding markers for RTL strings
          if ( rtl ) {
            translation = '\u202b' + translation + '\u202c';
          }
          else {
            translation = '\u202a' + translation + '\u202c';
          }
          var stringKey = repo.replace( /-/g, '_' ).toUpperCase() + '/' + row.getAttribute( 'data-string-key' );
          stringsToReplace[ stringKey ] = translation;
        }
      }
    } );

    // encode the strings in a form that can be used in a URL
    var encodedStrings = encodeURIComponent( JSON.stringify( stringsToReplace ) );
    encodedStrings = encodedStrings.replace( /%5C%5Cn/g, '%5Cn' ); // put back newlines

    var win = window.open( simUrl + '?' + 'strings=' + encodedStrings, '_blank' );
    win.focus();
  }

  testButtonTop.addEventListener( 'click', testTranslationNew );
  testButtonBottom.addEventListener( 'click', testTranslation );

  function saveButtonEventListener() {
    syncInputs();

    var strings = {};
    $( 'td input' ).each( function( index, item ) {
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

  // add highlight to '\n' and '{\d}' so users are aware that this is treated specially
  $( 'td:nth-child(2)' ).each( function( index, element ) {
    $( element ).html( $( element ).html().replace( /(\{\d\}|\\n)/g, '<span class=\'highlight\'>$1</span>' ) );
  } );

  /**
   * Make sure a string that should have pattern fields has the required fields in the translated string
   * @param row - the row of the table, including the english string and the input string
   * @returns {boolean}
   */
  function validateRow( row ) {

    var validated = true;

    // get the data cells for this row
    var tableDataCells = $( row ).find( 'td' );

    // only validate if there is some data (this skips header rows)
    if ( tableDataCells.length > 0 ) {

      // get the non-translated string
      var nonTranslatedString = $( tableDataCells[ 1 ] ).text();

      // get the user-submitted translated string
      var tableDataCell = $( tableDataCells[ 2 ] );
      var input = $( tableDataCell.find( 'div[contenteditable]' ).get( 0 ) );
      var translatedString = input.text();

      // create lists of the placeholders in the non-translated string
      var singleBracePlaceHolders = nonTranslatedString.match( SINGLE_BRACE_PATTERN_REGULAR_EXP ) || [];
      var doubleBracePlaceHolders = nonTranslatedString.match( DOUBLE_BRACE_PATTERN_REGULAR_EXP ) || [];

      // create the arrays where any missing or extra placeholders in the strings will be tracked
      var missingPlaceholders = [];
      var extraPlaceholders = [];

      // it is valid for the string to be empty, i.e. no translation submitted, so only validate if it is NOT empty
      if ( translatedString !== '' ) {

        var singleBracePlaceholdersInTranslation = translatedString.match( SINGLE_BRACE_PATTERN_REGULAR_EXP ) || [];
        var doubleBracePlaceholdersInTranslation = translatedString.match( DOUBLE_BRACE_PATTERN_REGULAR_EXP ) || [];

        var placeHolders = doubleBracePlaceHolders.concat( singleBracePlaceHolders );
        var placeHoldersInTranslation = doubleBracePlaceholdersInTranslation.concat( singleBracePlaceholdersInTranslation );

        // make sure every placeholder that exists in the untranslated string exists in the translation
        for ( var i = 0; i < placeHolders.length; i++ ) {
          if ( translatedString.length > 0 && translatedString.indexOf( placeHolders[ i ] ) === -1 ) {
            validated = false;
            missingPlaceholders.push( placeHolders[ i ] );
          }
          if ( placeHoldersInTranslation ) {
            var index = placeHoldersInTranslation.indexOf( placeHolders[ i ] );
            if ( index !== -1 ) {
              placeHoldersInTranslation.splice( index, 1 );
            }
          }
        }

        // make sure that no extra placeholders exist in the translation
        if ( placeHoldersInTranslation && placeHoldersInTranslation.length ) {
          validated = false;
          extraPlaceholders = placeHoldersInTranslation;
        }
      }

      // remove any previous error message that may be present
      tableDataCell.find( 'img:last-child' ).remove();

      // if the validation failed, add an error message
      if ( missingPlaceholders.length || extraPlaceholders.length ) {
        input.css( { outline: '1px solid red' } );
        var img = $( '<img>', { src: '/translate/img/warning.png', class: 'warning' } );
        tableDataCell.append( img );

        img.click( function() {
          var errorMessage = [ 'Your translation has the following errors:\n' ];
          if ( missingPlaceholders.length ) {
            errorMessage.push( 'missing placeholder(s) in submission: ' + missingPlaceholders.join( ', ' ) );
          }
          if ( extraPlaceholders.length ) {
            errorMessage.push( 'extra placeholder(s) in submission: ' + extraPlaceholders.join( ', ' ) );
          }
          alert( errorMessage.join( '\n' ) );
        } );
      }
      else {
        input.css( { outline: 'initial' } );
      }
    }

    return validated;
  }

  /**
   * Make sure every row has the required patterns
   * @returns {boolean}
   */
  function validatePatterns() {
    var validated = true;
    $( 'tr' ).each( function( index, item ) {
      if ( !validateRow( item ) ) {
        validated = false;
      }
    } );
    return validated;
  }

// validate the inputs before submitting the form
  $( '#strings' ).submit( function( event ) {
    if ( !validatePatterns() ) {
      $( '.validation-message' ).text( 'Your translation has MessageFormat errors. Please correct these before submitting.' );
      event.preventDefault();
    }
    else {
      $( '.validation-message' ).text( '' );

      // on submit make sure all of the inputs are synced with the content editable divs
      syncInputs();
    }
  } );

// fix dir and text-align for RTL languages
  if ( rtl ) {
    inputs.attr( 'dir', 'rtl' );
    inputs.css( 'text-align', 'right' );
  }

// disable pressing enter in inputs because it complicates things by adding <br> and possibly other html
  $( document ).on( 'keypress', inputSelector, function( e ) {
    return e.which !== 13;
  } );

// on every change, copy the content from the editable div to a hidden input so it gets submitted with the form
  $( document ).on( 'keyup paste', inputSelector, function( e ) {
    var contentEditable = $( this );
    var input = contentEditable.next().get( 0 );
    input.value = contentEditable.text();

    // need to set a timeout after pasting in so that the paste has time to take effect
    if ( e.type === 'paste' ) {
      setTimeout( function() {
        input.value = contentEditable.text();
        contentEditable.text( contentEditable.text() );
      }, 50 );
    }

    // undo-gray saved button on any input change
    if ( !once ) {
      $( '.savedSpan' ).attr( 'style', 'visibility: hidden' );
      restoreButton( saveButtonTop );
      restoreButton( saveButtonBottom );
      once = true;
    }
  } );

// on blur, validate the row to make sure it has the correct patterns
  $( document ).on( 'blur', inputSelector, function( e ) {
    var row = this.parentNode.parentNode;
    validateRow( row );
  } );

  $( document ).on( 'focus', inputSelector, function( e ) {
    setEndOfContentEditable( this );
  } );

} );
