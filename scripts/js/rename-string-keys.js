// Copyright 2022, University of Colorado Boulder

/**
 * This file defines a NodeJS script that can be used to rename string keys in translations where the English string key
 * has changed.  This script was created to support a situation where a sim had been published as a prototype, had
 * several translations submitted, had some string keys changed by the developer(s), and then was about to be re-
 * published as a production version.  See https://github.com/phetsims/geometric-optics/issues/393 for more information.
 *
 * This script must be run in the root development directory.
 *
 * The input string file must be in comma-separated format with the new string keys in the first column and the old
 * string keys in the second column.  Any row that doesn't have two columns is assumed to be a new key and will be
 * ignored.
 *
 * USAGE:
 *
 * node rename-string-keys <sim-repo-name> <string-change-info>
 *
 * EXAMPLE USAGE:
 *
 * node ./rosetta/scripts/js/rename-string-keys.js geometric-optics ./temp/geometric-optics-changed-strings.csv
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// imports
const fs = require( 'fs' );

// helper function for aborting on an error
const logMessageAndAbort = message => {
  console.error( message );
  process.exit( 1 );
};

// Extract the arguments.
const args = process.argv.slice( 2 );

// Verify that the number of arguments is correct.
if ( args.length !== 2 ) {
  logMessageAndAbort( '\nUsage:\n  node rename-string-keys <sim-repo-name> <string-change-info>' );
}

// Verify that the specified sim repo exists.
const simRepoName = args[ 0 ];
if ( !fs.existsSync( `./${simRepoName}` ) ) {
  logMessageAndAbort( `Specified sim directory not found: ${simRepoName}, aborting.` );
}

// Verify that the repo has an English strings file.
const englishStringsFileName = `./${simRepoName}/${simRepoName}-strings_en.json`;
if ( !fs.existsSync( englishStringsFileName ) ) {
  logMessageAndAbort( `Unable to find strings file: ${englishStringsFileName}, aborting.` );
}

// Verify that the file that specifies the changed strings exists.
const changedStringsFileName = args[ 1 ];
if ( !fs.existsSync( `./${changedStringsFileName}` ) ) {
  logMessageAndAbort( `String change file not found: ${changedStringsFileName}, aborting.` );
}

// Read in the contents of the changed strings file, dividing it into separate lines in the process.
let changeStringsFileLines = fs.readFileSync( changedStringsFileName, 'utf8' ).split( '\n' );

// On at least some systems, such as Windows, splitting the lines up this way can result in there being a carriage
// return at the end of the string.  Remove any such characters.
changeStringsFileLines = changeStringsFileLines.map( activeRepo => activeRepo.replace( '\r', '' ) );

// Create a Map of old-to-new string key values, skipping any lines that don't specify an old value.
const oldToNewStringKeyNames = new Map();
changeStringsFileLines.forEach( ( fileLine, index ) => {
  const values = fileLine.split( ',' );

  // If there are two values and no spaces, add this pair to the Map.  Note that for the original case in which this
  // script was used, this test also skipped the header row.  This may not work if the script is reused, so adjust as
  // needed.
  if ( values.length === 2 && values[ 0 ] !== values[ 1 ] && values[ 1 ].length > 0 &&
       !values[ 0 ].includes( ' ' ) && !values[ 1 ].includes( ' ' ) ) {

    // Add this pair to the Map, UNLESS it's the header row.  This test is pretty specific to the case for which this
    // script was originally developed, and may need to be improved upon if the script is reused.
    if ( !( index === 0 && values[ 0 ].includes( ' ' ) ) ) {
      oldToNewStringKeyNames.set( values[ 1 ], values[ 0 ] );
    }
  }
  else if ( values.length > 2 ) {
    logMessageAndAbort( `unexpected line in changed strings file: ${fileLine}` );
  }
} );

const englishStringsObject = JSON.parse( fs.readFileSync( englishStringsFileName, 'utf8' ) );

// Verify that all of the new string keys exist in the English strings file.
oldToNewStringKeyNames.forEach( newStringKeyName => {
  if ( !englishStringsObject[ newStringKeyName ] ) {
    logMessageAndAbort( `Error: New string key not found in English strings file: ${newStringKeyName}` );
  }
} );

// Log a list of the key changes.
console.log( '\nThe following string key renames will be attempted:' );
oldToNewStringKeyNames.forEach( ( newStringKey, oldStringKey ) => {
  console.log( `  ${oldStringKey} ---> ${newStringKey}` );
} );

// Make a list of all the translation files.
let translatedStringFiles = fs.readdirSync( `./babel/${simRepoName}/` );

// Bail out if there aren't any translations.
if ( translatedStringFiles.length === 0 ) {
  logMessageAndAbort( 'No translations found, aborting.' );
}

// Add the full path to each of the translation files to make things a little easier.
translatedStringFiles = translatedStringFiles.map( fileName => `./babel/${simRepoName}/${fileName}` );

// Add a header for the next portion of console output.
console.log( '\nString key modifications complete for:' );

// Read in each translation, update the string keys, and write it back out.
translatedStringFiles.forEach( translatedStringFile => {
  const translation = JSON.parse( fs.readFileSync( translatedStringFile, 'utf8' ) );

  oldToNewStringKeyNames.forEach( ( newStringKey, oldStringKey ) => {

    // First, verify that the new string key doesn't already exist in the translation, because it shouldn't.
    if ( translation[ newStringKey ] ) {
      logMessageAndAbort( `Error: new string key "${newStringKey} already exists in translation file ${translatedStringFile}` );
    }

    // Only add the new key if the old one is present.  If the old key doesn't exist, that's okay, it simply means that
    // the translator didn't translate it.  In this case, there is no need to add the new key.
    if ( translation[ oldStringKey ] ) {

      // Add the new key, using the value from the old key.
      translation[ newStringKey ] = translation[ oldStringKey ];

      // Delete the old key.
      delete translation[ oldStringKey ];
    }
  } );

  // Write the output.
  fs.writeFileSync( translatedStringFile, JSON.stringify( translation, null, 2 ) );
  console.log( `  ${translatedStringFile}` );
} );

console.log( '\nOperation complete.  Please check the changes and commit if they appear to be correct.' );