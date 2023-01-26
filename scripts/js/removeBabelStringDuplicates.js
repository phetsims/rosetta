// Copyright 2022, University of Colorado Boulder

/**
 * NodeJS script for removing strings that are duplicated in babel subdirectories.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

// modules
const fs = require( 'fs' );

const REPOS_WITH_STRING_DUPLICATES = [
  'number-play',
  'number-compare',
  'number-suite-common'
];

REPOS_WITH_STRING_DUPLICATES.forEach( repoName => {

  // read the string file and turn it into an object
  const enStringFile = fs.readFileSync( `./${repoName}/${repoName}-strings_en.json`, 'utf8' );
  const enStringKeys = Object.keys( JSON.parse( enStringFile ) );

  console.log( `\nlooking for duplicates in ${repoName}\n` );

  const files = fs.readdirSync( `./babel/${repoName}` );

  // iterate through all translated string files for repoName in babel
  files.forEach( fileName => {

    const translatedStringsFileName = `./babel/${repoName}/${fileName}`;
    const translatedStrings = JSON.parse( fs.readFileSync( translatedStringsFileName, 'utf8' ) );

    // remove the data of any translated string that's not found in the english strings
    for ( const key in translatedStrings ) {
      !enStringKeys.includes( key ) && delete translatedStrings[ key ];
    }

    console.log( `writing new file: ${fileName}` );
    fs.writeFileSync( translatedStringsFileName, JSON.stringify( translatedStrings, null, 2 ) );
  } );

} );