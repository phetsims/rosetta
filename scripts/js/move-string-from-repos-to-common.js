// Copyright 2022, University of Colorado Boulder

/**
 * NodeJS script for moving a string that is repeated in several sims to a location in common code.  This was originally
 * created to move the "Projector Mode" string to joist.  See
 * https://github.com/phetsims/joist/issues/342.
 *
 * Run the script from Rosetta's root directory with:
 * sage run rosetta/scripts/js/move-string-from-repos-to-common.js
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

// modules
const fs = require( 'fs' );
const _ = require( 'lodash' );

// constants
const SIMS_WITH_STRING = [
  'your-sim',
  'another-sim'
];

const TARGET_REPO = 'target-common-repo';
const STRING = 'stringKey';

// helper function
function extractLocaleFromFileName( fileName ) {
  const localeStartIndex = fileName.indexOf( '_' ) + 1;
  const localeEndIndex = fileName.indexOf( '.' );
  return fileName.substring( localeStartIndex, localeEndIndex );
}

console.log( 'Starting move.' );

SIMS_WITH_STRING.forEach( simName => {

  const pathToStringsDir = '../babel/' + simName;
  const stringFileNameList = fs.readdirSync( pathToStringsDir );

  console.log( '================' );
  console.log( 'simName = ' + simName );

  stringFileNameList.forEach( stringFileName => {

    // read the string file and turn it into an object
    fs.readFileSync( pathToStringsDir + '/' + stringFileName, 'utf8' );
    const stringsObject = JSON.parse( fs.readFileSync( pathToStringsDir + '/' + stringFileName, 'utf8' ) );

    // look for a translation of the string and, if found, extract it and add it to the common code strings file
    _.keys( stringsObject ).forEach( stringKey => {
      if ( stringKey.indexOf( STRING ) >= 0 ) {
        const locale = extractLocaleFromFileName( stringFileName );
        console.log( 'found translation for sim: ', simName, ', locale: ', locale );

        // find the joist string file for this locale
        const targetStringFileName = `../babel/${TARGET_REPO}/${TARGET_REPO}-strings_` + locale + '.json';

       // If the file does not exist, we will create a new one.
        if ( fs.existsSync( targetStringFileName ) ) {

          // read in the joist string data
          const stringsData = JSON.parse( fs.readFileSync( targetStringFileName, 'utf8' ) );

          // Do not add translations that already exist in the target file.
          if ( stringsData[ STRING ] ) {
            console.log( 'WARNING: string already exists in translation file: ', targetStringFileName );
            console.log( 'Reading next file without adding string.' );
          }
          else {
            // add in the new translated value
            stringsData[ STRING ] = stringsObject[ stringKey ];

            // write the modified string file
            console.log( 'adding new string to file: ', stringFileName );
            fs.writeFileSync( targetStringFileName, JSON.stringify( stringsData, null, 2 ) );
          }
        }
        else {
          console.log( 'WARNING: target file does not exist: ', targetStringFileName );
          const newStringsData = {
            [ STRING ]: stringsObject[ stringKey ]
          };

          console.log( 'creating new file with string data:', newStringsData );
          fs.writeFileSync( targetStringFileName, JSON.stringify( newStringsData, null, 2 ) );
        }

      }
    } );
  } );
} );