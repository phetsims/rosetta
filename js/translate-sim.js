// Copyright 2015-2018, University of Colorado Boulder

/**
 * Javascript for translate-sim.html
 * @author Michael Kauzmann
 * @author Aaron Davis
 * @author John Blanco
 */

'use strict';

// constants
const SINGLE_BRACE_PATTERN_REGULAR_EXP = /\{\d+\}/g;
const DOUBLE_BRACE_PATTERN_REGULAR_EXP = /\{\{\w+\}\}/g;

/**
 * Modified from http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
 * @param contentEditableElement
 */
function setEndOfContentEditable( contentEditableElement ) {

  let range;

  // Firefox, Chrome, Opera, Safari, IE 9+
  if ( document.createRange ) {
    range = document.createRange();
    range.selectNodeContents( contentEditableElement );

    // uncomment the following line to move the cursor to the end of the input instead of selecting all
    // range.collapse( false );
    const selection = window.getSelection();
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

  const testButtonTop = document.getElementById( 'testButtonTop' );
  const saveButtonTop = document.getElementById( 'saveButtonTop' );
  const testButtonBottom = document.getElementById( 'testButtonBottom' );
  const saveButtonBottom = document.getElementById( 'saveButtonBottom' );
  const simData = document.getElementById( 'simData' );
  const rtl = simData.getAttribute( 'data-direction' ) === 'rtl';
  const savedSpans = $( '.savedSpan' );

  // flag to help only restore save button once from inputs
  let once = false;

  // selector for content-editable divs (where the user input goes)
  const inputSelector = '.string-translation-table div[contenteditable]';
  const inputs = $( inputSelector );

  /**
   * Copy all of the content-editable text into the hidden inputs to be submitted
   */
  function syncInputs() {
    inputs.each( function( index, element ) {
      const contentEditable = $( element );
      const input = contentEditable.next().get( 0 );
      input.value = contentEditable.text();
    } );
  }

  /**
   * Test the translation by popping up the sim in a new window with the English strings replaced with those submitted
   * on the translation form.
   */
  function testTranslation() {

    // Bail if the patterns don't validate - calling this will cause any errors to be highlighted on the form.
    if ( !validatePatterns() ) {
      return;
    }

    // NOTE TO FUTURE MAINTAINERS: I (jbphet) tried using jQuery's post method for the post performed below, but it
    // triggered my popup blocker.  The approach used below, which creates a temporary form element and submits it,
    // didn't trigger the popup blocker, so I went with it.

    // create the URL for the post request
    const testTranslationURL = window.location.origin + '/translate/sim/test/' + simData.getAttribute( 'data-sim-name' );

    // create a form whose response will appear in a new window
    const translatedStringsForm = document.createElement( 'form' );
    translatedStringsForm.target = '_blank';
    translatedStringsForm.method = 'POST';
    translatedStringsForm.action = testTranslationURL;

    // fill in the fields of this new form with the data from the main strings form
    const inputs = $( '.string-translation-table tr' );
    inputs.each( function( i, row ) {
      const contentEditable = $( $( row ).find( 'div[contenteditable]' ).get( 0 ) );
      if ( contentEditable ) {
        let translation = contentEditable.text();
        const repo = row.getAttribute( 'data-string-repo' );
        if ( repo && translation && translation.length > 0 ) {

          // add RTL embedding markers for RTL strings
          if ( rtl ) {
            translation = '\u202b' + translation + '\u202c';
          }
          else {
            translation = '\u202a' + translation + '\u202c';
          }

          // create an input field for the translated string
          const input = document.createElement( 'input' );
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

  testButtonTop.addEventListener( 'click', testTranslation );
  testButtonBottom.addEventListener( 'click', testTranslation );

  function saveButtonEventListener() {
    syncInputs();

    const strings = {};
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
      }
    );
  }

  // add highlight to '\n', '{\d}', and '{{\w+}}' so users are aware that this is treated specially
  $( 'td:nth-child(2)' ).each( function( index, element ) {
    $( element ).html( $( element ).html().replace( /(\{\d\}|\\n)/g, '<span class=\'highlight\'>$1</span>' ) );
    $( element ).html( $( element ).html().replace( DOUBLE_BRACE_PATTERN_REGULAR_EXP, '<span class=\'highlight\'>$&</span>' ) );
  } );

  /**
   * Make sure a string that should have pattern fields has the required fields in the translated string
   * @param row - the row of the table, including the english string and the input string
   * @returns {boolean}
   */
  function validateRow( row ) {

    let validated = true;

    // get the data cells for this row
    const tableDataCells = $( row ).find( 'td' );

    // only validate if there is some data (this skips header rows)
    if ( tableDataCells.length > 0 ) {

      // get the non-translated string
      const nonTranslatedString = $( tableDataCells[ 1 ] ).text();

      // get the user-submitted translated string
      const tableDataCell = $( tableDataCells[ 2 ] );
      const input = $( tableDataCell.find( 'div[contenteditable]' ).get( 0 ) );
      const translatedString = input.text();

      // create lists of the placeholders in the non-translated string
      const singleBracePlaceHolders = nonTranslatedString.match( SINGLE_BRACE_PATTERN_REGULAR_EXP ) || [];
      const doubleBracePlaceHolders = nonTranslatedString.match( DOUBLE_BRACE_PATTERN_REGULAR_EXP ) || [];

      // create the arrays where any missing or extra placeholders in the strings will be tracked
      const missingPlaceholders = [];
      let extraPlaceholders = [];

      // error message for tags
      let badTagMessage;

      // it is valid for the string to be empty, i.e. no translation submitted, so only validate if it is NOT empty
      if ( translatedString !== '' ) {

        // verify placeholders
        const singleBracePlaceholdersInTranslation = translatedString.match( SINGLE_BRACE_PATTERN_REGULAR_EXP ) || [];
        const doubleBracePlaceholdersInTranslation = translatedString.match( DOUBLE_BRACE_PATTERN_REGULAR_EXP ) || [];
        const placeHolders = doubleBracePlaceHolders.concat( singleBracePlaceHolders );
        const placeHoldersInTranslation = doubleBracePlaceholdersInTranslation.concat( singleBracePlaceholdersInTranslation );

        // make sure every placeholder that exists in the untranslated string exists in the translation
        for ( let i = 0; i < placeHolders.length; i++ ) {
          if ( translatedString.length > 0 && translatedString.indexOf( placeHolders[ i ] ) === -1 ) {
            validated = false;
            missingPlaceholders.push( placeHolders[ i ] );
          }
          if ( placeHoldersInTranslation ) {
            const index = placeHoldersInTranslation.indexOf( placeHolders[ i ] );
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

        // verify tags
        const openTags = ( nonTranslatedString.match( /\<[a-zA-Z0-9]+/g ) || [] ).map( s => s.slice( 1 ) );
        const closedTags = ( nonTranslatedString.match( /\<\/[a-zA-Z0-9]+/g ) || [] ).map( s => s.slice( 2 ) );
        const tags = openTags.filter( tag => closedTags.includes( tag ) );

        for ( const tag of tags ) {
          const openMatch = translatedString.match( new RegExp( `<${tag}[\\s\\>]` ) );
          const closedMatch = translatedString.match( new RegExp( `</${tag}[\\s\\>]` ) );

          const openIndex = openMatch ? openMatch.index : -1;
          const closedIndex = closedMatch ? closedMatch.index : -1;

          const hasOpen = openIndex >= 0;
          const hasClosed = closedIndex >= 0;

          if ( hasOpen ^ hasClosed ) {
            validated = false;
            badTagMessage = `Tag is missing opening or closing for: ${tag}`;
          }
          else if ( hasOpen && hasClosed && closedIndex < openIndex ) {
            validated = false;
            badTagMessage = `Tag is out of order: ${tag}`;
          }
        }
      }

      // remove any previous error message that may be present
      tableDataCell.find( 'img:last-child' ).remove();

      // if the validation failed, add an error message
      if ( !validated ) {
        input.css( { outline: '1px solid red' } );
        const img = $( '<img>', { src: '/translate/img/warning.png', class: 'warning' } );
        tableDataCell.append( img );

        img.click( function() {
          const errorMessage = [ 'Your translation has the following errors:\n' ];
          if ( missingPlaceholders.length ) {
            errorMessage.push( 'missing placeholder(s) in submission: ' + missingPlaceholders.join( ', ' ) );
          }
          if ( extraPlaceholders.length ) {
            errorMessage.push( 'extra placeholder(s) in submission: ' + extraPlaceholders.join( ', ' ) );
          }
          if ( badTagMessage ) {
            errorMessage.push( badTagMessage );
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
    let validated = true;
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
    const contentEditable = $( this );
    const input = contentEditable.next().get( 0 );
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
    const row = this.parentNode.parentNode;
    validateRow( row );
  } );

  $( document ).on( 'focus', inputSelector, function( e ) {
    setEndOfContentEditable( this );
  } );

} );
