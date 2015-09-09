// Copyright 2002-2015, University of Colorado Boulder

/**
 * Javascript for translate-sim.html
 * @author Michael Kauzmann
 * @author Aaron Davis
 */
$( document ).ready( function() {

  var testButtonTop = document.getElementById( 'testButtonTop' );
  var saveButtonTop = document.getElementById( 'saveButtonTop' );
  var testButtonBottom = document.getElementById( 'testButtonBottom' );
  var saveButtonBottom = document.getElementById( 'saveButtonBottom' );
  var simData = document.getElementById( 'simData' );
  var rtl = simData.getAttribute( 'data-direction' ) === 'rtl';

  function testButtonEventListener() {
    var simUrl = simData.getAttribute( 'data-sim-url' );
    var stringsToReplace = {};
    var inputs = $( '.rosetta-table tr' );
    inputs.each( function( i, row ) {
      var input = $( row ).find( 'input' ).get( 0 );
      if ( input ) {
        var translation = input.value;
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

  // add highlight to '\n' and '{\d}' so users are aware that this is treated specially
  $( 'td:nth-child(2)' ).each( function( index, element ) {
    $( element ).html( $( element ).html().replace( /(\{\d\}|\\n)/g, '<span class=\'highlight\'>$1</span>' ) );
  } );

  // fix dir and text-align for rtl languages
  if ( rtl ) {
    inputs.attr( 'dir', 'rtl' );
    inputs.css( 'text-align', 'right' );
  }

  /**
   * Make sure a string that should have pattern fields has the required fields in the translated string
   * @param row - the row of the table, including the english string and the input string
   * @returns {boolean}
   */
  function validateRow( row ) {
    var validated = true;
    var tds = $( row ).find( 'td' );
    var matches = $( tds[ 1 ] ).text().match( /\{\d\}/g );
    if ( matches ) {
      var td = $( tds[ 2 ] );
      var input = $( td.find( 'div[contenteditable]' ).get( 0 ) );
      var value = input.text();
      var redOutline = false;
      var missingPlaceholders = [];
      var extraPlaceholders = [];

      // make sure every MessageFormat placeholder that exists in the English exists in the translation
      for ( var i = 0; i < matches.length; i++ ) {
        if ( value.length > 0 && value.indexOf( matches[ i ] ) === -1 ) {
          validated = false;
          redOutline = true;
          missingPlaceholders.push( matches[ i ] );
        }
      }

      // make sure the are no MessageFormat placeholders that exist in the translation that don't exist in the English
      var regExp = new RegExp( '\{[' + matches.length + '-9]\}', 'g' );
      var extraMatches = value.match( regExp );
      if ( extraMatches !== null ) {
        redOutline = true;
        validated = false;
        extraPlaceholders = extraMatches;
      }

      if ( redOutline ) {
        input.css( { outline: '1px solid red' } );
        if ( !td.find( 'img:last-child' ).length ) {
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
      }
      else {
        input.css( { outline: 'initial' } );
        td.find( 'img:last-child' ).remove();
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
    }
  } );

  var inputSelector = '.rosetta-table div[contenteditable]';

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
        contentEditable.html( contentEditable.text() );
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
} );
