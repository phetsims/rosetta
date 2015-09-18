// Copyright 2002-2015, University of Colorado Boulder

/**
 * Javascript for translate-sim.html
 * @author Michael Kauzmann
 * @author Aaron Davis
 */

/**
 * Modified from http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
 * @param contentEditableElement
 */
function setEndOfContenteditable( contentEditableElement ) {

  // Firefox, Chrome, Opera, Safari, IE 9+
  if ( document.createRange ) {
    var range = document.createRange();
    range.selectNodeContents( contentEditableElement );

    // uncomment the following line to move the cursor to the end of the input instead of selecting all
    // range.collapse( false );
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange( range );
  }

  // IE 8 and lower
  else if ( document.selection ) {
    var range = document.body.createTextRange();
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

  // Var to help only restore save button once from inputs
  var once = false;

  // selector for content-editable divs (where the user input goes)
  var inputSelector = '.rosetta-table div[contenteditable]';
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

  function testButtonEventListener() {
    var simUrl = simData.getAttribute( 'data-sim-url' );
    var stringsToReplace = {};
    var inputs = $( '.rosetta-table tr' );
    inputs.each( function( i, row ) {
      var contentEditable = $( $( row ).find( 'div[contenteditable]' ).get( 0 ) );
      if ( contentEditable ) {
        var translation = contentEditable.text();
        var repo = row.getAttribute( 'data-string-repo' );
        if ( repo && translation && translation.length > 0 ) {
          // add rtl embedding markers for rtl strings
          if ( rtl ) {
            translation = '%E2%80%AB' + translation + '%E2%80%AC';
          }
          var stringKey = repo.replace( /-/g, '_' ).toUpperCase() + '/' + row.getAttribute( 'data-string-key' );
          stringsToReplace[ stringKey ] = translation;
        }
      }
    } );
    var encodedStrings = encodeURIComponent( JSON.stringify( stringsToReplace ) );
    encodedStrings = encodedStrings.replace( /%5C%5Cn/g, '%5Cn' ); // put back newlines

    var win = window.open( simUrl + '?' + 'strings=' + encodedStrings, '_blank' );
    win.focus();
  }

  testButtonTop.addEventListener( 'click', testButtonEventListener );
  testButtonBottom.addEventListener( 'click', testButtonEventListener );

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
    var messageFormatRegexp = /\{\d+\}/g;
    var tds = $( row ).find( 'td' );
    var englishMatches = $( tds[ 1 ] ).text().match( messageFormatRegexp );
    if ( englishMatches ) {
      var td = $( tds[ 2 ] );
      var input = $( td.find( 'div[contenteditable]' ).get( 0 ) );
      var value = input.text();
      var missingPlaceholders = [];
      var extraPlaceholders = [];

      var translatedMatches = value.match( messageFormatRegexp );

      // make sure every MessageFormat placeholder that exists in the English exists in the translation
      for ( var i = 0; i < englishMatches.length; i++ ) {
        if ( value.length > 0 && value.indexOf( englishMatches[ i ] ) === -1 ) {
          validated = false;
          missingPlaceholders.push( englishMatches[ i ] );
        }
        if ( translatedMatches ) {
          var index = translatedMatches.indexOf( englishMatches[ i ] );
          if ( index !== -1 ) {
            translatedMatches.splice( index, 1 );
          }
        }
      }
      if ( translatedMatches && translatedMatches.length ) {
        validated = false;
        extraPlaceholders = translatedMatches;
      }

      td.find( 'img:last-child' ).remove(); // remove the old error message either way
      if ( missingPlaceholders.length || extraPlaceholders.length ) {
        input.css( { outline: '1px solid red' } );
        var img = $( '<img>', { src: '/translate/img/warning.png', class: 'warning' } );
        td.append( img );

        img.click( function() {
          var errorMessage = [ 'Your translation has the following errors:\n' ];
          if ( missingPlaceholders.length ) {
            errorMessage.push( 'missing MessageFormat placeholders: ' + missingPlaceholders.join( ', ' ) );
          }
          if ( extraPlaceholders.length ) {
            errorMessage.push( 'extra MessageFormat placeholders: ' + extraPlaceholders.join( ', ' ) );
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
      $( '.validation-message' ).text( 'Your translation has MessageFormat errors. Please correct these before submitting' );
      event.preventDefault();
    }
    else {
      $( '.validation-message' ).text( '' );

      // on submit make sure all of the inputs are synced with the content editable divs
      syncInputs();
    }
  } );

  // fix dir and text-align for rtl languages
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
    setEndOfContenteditable( this );
  } );

} );
