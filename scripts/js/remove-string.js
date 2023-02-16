// Copyright 2022, University of Colorado Boulder

/**
 * This file defines a NodeJS script that can be used to remove a string from the English string file and all
 * translations.  This should only be done for a string that is fully retired, and there are no published versions of a
 * sim that reference it.  Be particularly careful if using this on common code, since the master versions of common
 * code strings are used for all builds, i.e. we don't branch the translated common-code string files.
 *
 * This was originally created to remove some unused strings from the preferences dialog, see
 * https://github.com/phetsims/joist/issues/772.
 *
 * This should be used from your root development directory, i.e. the one that holds babel, joist, chipper, etc.
 *
 * USAGE:
 *
 *   node remove-string-key <repo-name> <string-key>
 *
 * EXAMPLE USAGE:
 *
 *   node ./rosetta/scripts/js/remove-string-key.js joist preferences.tabs.general.simulationSpecificSettings
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
  logMessageAndAbort( '\nUsage:\n  node remove-string-key <sim-repo-name> <string-change-info>' );
}
const repoName = args[ 0 ];
const stringKeyToRemove = args[ 1 ];

// Verify that the specified sim repo exists.
if ( !fs.existsSync( `./${repoName}` ) ) {
  logMessageAndAbort( `Specified sim directory not found: ${repoName}, aborting.` );
}

// Verify that the repo has an English strings file.
const englishStringsFileName = `./${repoName}/${repoName}-strings_en.json`;
if ( !fs.existsSync( englishStringsFileName ) ) {
  logMessageAndAbort( `Unable to find strings file: ${englishStringsFileName}, aborting.` );
}

// Read in the English strings.
const englishStringsObject = JSON.parse( fs.readFileSync( englishStringsFileName, 'utf8' ) );

// Start the console output.
console.log( '\n' );

let removalCount = 0;

// If the English string file has the key, remove it and write it back out.  If not, log a warning and continue.
if ( englishStringsObject[ stringKeyToRemove ] ) {
  delete englishStringsObject[ stringKeyToRemove ];
  removalCount++;
  fs.writeFileSync( englishStringsFileName, JSON.stringify( englishStringsObject, null, 2 ) );
  console.log( `Deleted string ${stringKeyToRemove} from English strings file.` );
}
else {
  console.warn( 'The specified string does not exist in the English version of the file, so no changes were made.' );
}

// Make a list of all the translation files.
let translatedStringFiles = fs.readdirSync( `./babel/${repoName}/` );

// Bail out if there aren't any translations.
if ( translatedStringFiles.length === 0 ) {
  logMessageAndAbort( 'No translations found, aborting.' );
}

// Add the full path to each of the translation files to make things a little easier.
translatedStringFiles = translatedStringFiles.map( fileName => `./babel/${repoName}/${fileName}` );

// Add a header for the next portion of console output.
console.log( `\nChecking for and removing string key ${stringKeyToRemove} and its value:` );

// Read in each translation, remove the key if it exists, and write it back out.
translatedStringFiles.forEach( translatedStringFile => {
  const translation = JSON.parse( fs.readFileSync( translatedStringFile, 'utf8' ) );
  if ( translation[ stringKeyToRemove ] ) {
    delete translation[ stringKeyToRemove ];
    fs.writeFileSync( translatedStringFile, JSON.stringify( translation, null, 2 ) );
    removalCount++;
    console.log( `  ${translatedStringFile} - removed` );
  }
  else {
    console.log( `  ${translatedStringFile} - removed` );
  }
} );

console.log( `\nRemoved the string from ${removalCount} files.` );
console.log( 'Please check the changes and commit if they appear to be correct.' );