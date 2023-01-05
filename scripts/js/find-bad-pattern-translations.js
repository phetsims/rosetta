/* eslint-disable */
// Copyright 2023, University of Colorado Boulder

/**
 * NodeJS script to find and print out bad translations of patterns.  A bad translation of a pattern is one where the
 * pattern variable names have been changed, such as changing "{{value}} {{units}}" to "{{val}} {{uns}}".  See
 * https://github.com/phetsims/rosetta/issues/329 for history on the need for this script.
 *
 * This is intended to be used from the root directory of a checkout of the PhET code base, since it needs the rosetta
 * repo, the babel repo, and the repos for every translated sim.
 *
 * Example usage (from base directory of a checkout):
 *
 *   node ./rosetta/scripts/js/find-bad-pattern-translations.js
 *
 * @author John Blanco
 */

// modules
const fs = require( 'fs' );

// constants
const templateVarRegex = /{\{?\w+}}?/g;
const TRANSLATION_STRINGS_REPO_PATH = './babel';

// Define a simple assert function to help with debugging.
const assert = ( condition, msg = 'assertion failed' ) => {
  if ( !condition ) {
    throw new Error( msg );
  }
};

// Verify that the translation directory is present.
assert( fs.lstatSync( TRANSLATION_STRINGS_REPO_PATH ).isDirectory(), 'translation directory not found' );

console.log( 'Analyzing translations for mismatched patterns...' );

// Create a list of all the sims for which translations exist.
const listOfSimReposWithTranslations = fs.readdirSync( TRANSLATION_STRINGS_REPO_PATH ).filter( dirName => {
    const fullPath = TRANSLATION_STRINGS_REPO_PATH + '/' + dirName;
    return !dirName.startsWith( '_' ) && !dirName.startsWith( '.' ) && fs.lstatSync( fullPath ).isDirectory();
  }
);

// Keep track of the number of mismatched patterns so that it can be reported at the end.
let numberOfMismatchedPatternsFound = 0;

// For each sim repo for which one or more translations exist, get the English strings and validate the patterns within
// it against the translations.
listOfSimReposWithTranslations.forEach( simRepoName => {

  // Assemble the path to the English strings file.  IMPORTANT NOTE: This uses the English strings from the master
  // branch, which isn't quite correct, since it should be using the strings file from the published sim.  However, this
  // works most of the time and is far simpler, so should be adequate for the purposes of this script.
  const pathToRepo = `./${simRepoName}`;
  assert( fs.lstatSync( pathToRepo ).isDirectory(), `path to sim repo not found: ${pathToRepo}` );
  const pathToEnglishStrings = `${pathToRepo}/${pathToRepo}-strings_en.json`;
  assert( fs.lstatSync( pathToEnglishStrings ).isFile(), `sim strings file not found: ${pathToEnglishStrings}` );

  // Read in the English strings file.
  const englishStrings = JSON.parse( fs.readFileSync( pathToEnglishStrings ).toString() );

  // Read in all the translated strings and put them in a Map using the file name as the key.
  const translationsMap = new Map();
  const pathToTranslations = `${TRANSLATION_STRINGS_REPO_PATH}/${simRepoName}`;
  const translationFileNames = fs.readdirSync( pathToTranslations );
  translationFileNames.forEach( translationFileName => {
    const translationFilePath = `${pathToTranslations}/${translationFileName}`;
    const translatedStringsObject = JSON.parse( fs.readFileSync( translationFilePath ).toString() );
    translationsMap.set( translationFileName, translatedStringsObject );
  } );

  // For each English string, test if it is a pattern and, if so, verify that all translations of the pattern are valid.
  Object.keys( englishStrings ).forEach( stringKey => {

    // Skip all accessibility strings, since they are not currently translated.
    if ( stringKey !== 'a11y' ) {

      const englishStringValue = englishStrings[ stringKey ].value;
      templateVarRegex.lastIndex = 0;
      if ( templateVarRegex.test( englishStringValue ) ) {

        // This string is a pattern.  Make sure the translations of it are valid.
        translationsMap.forEach( ( translatedStringsObject, translatedFileName ) => {
          if ( translatedStringsObject[ stringKey ] && translatedStringsObject[ stringKey ].value ) {

            const translatedStringValue = translatedStringsObject[ stringKey ].value;

            // Extract a list of all template variables from the English string.
            templateVarRegex.lastIndex = 0;
            const templatedVars = englishStringValue.match( templateVarRegex );

            // Determine whether the templated variables all exist in the translated string.
            let match = true;
            templatedVars.forEach( templatedVar => {
              if ( !translatedStringValue.includes( templatedVar ) ) {
                match = false;
              }
            } );

            if ( !match ) {
              numberOfMismatchedPatternsFound++;
              console.log( '---------------' );
              console.log( 'Pattern mismatch detected:' );
              console.log( `  translatedFileName = ${translatedFileName}` );
              console.log( `  stringKey = ${stringKey}` );
              console.log( `  englishStringValue = ${englishStringValue}` );
              console.log( `  translated value = ${translatedStringsObject[ stringKey ].value}` );
            }
          }
        } );
      }
    }
  } );
} );

console.log( `\nAnalysis complete, number of mismatched patterns found = ${numberOfMismatchedPatternsFound}` );