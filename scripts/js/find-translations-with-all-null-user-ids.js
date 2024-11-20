// Copyright 2023, University of Colorado Boulder

/**
 * Script to find all translations that have null values for the user IDs.  Created as part of the work for
 * https://github.com/phetsims/rosetta/issues/412.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

const _ = require( 'lodash' );
const fs = require( 'fs' );
const getTranslatedStringFileList = require( './common/getTranslatedStringFileList' );

// Get a list of all translation string files.
const translationStringFileNames = getTranslatedStringFileList();

translationStringFileNames.forEach( translationStringFileName => {

  // Get all lines in the file that contain a user ID.
  const fileContent = fs.readFileSync( translationStringFileName, 'utf-8' );
  const userIdLines = fileContent.split( '\n' ).filter( line => line.includes( 'userId' ) );

  if ( userIdLines.length > 0 ) {
    const uniqueUserIdLines = _.uniq( userIdLines );
    if ( uniqueUserIdLines.length === 1 && uniqueUserIdLines[ 0 ].includes( 'null' ) ) {
      console.log( `translationStringFileName = ${translationStringFileName}` );
    }
  }
} );