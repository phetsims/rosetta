// Copyright 2022, University of Colorado Boulder

/**
 * NodeJS script for removing strings that are duplicated in babel subdirectories.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

/* eslint-env node */

// modules
const fs = require( 'fs' );

const REPOS_WITH_STRING_DUPLICATES = [
  'number-play',
  'number-compare',
  'number-suite-common'
];

REPOS_WITH_STRING_DUPLICATES.forEach( repoName => {

  // read the string file and turn it into an object
  const jsonFile = fs.readFileSync( `./${repoName}/${repoName}-strings_en.json`, 'utf8' );
  const stringKeys = Object.keys( JSON.parse( jsonFile ) );

  console.log( `\nlooking for duplicates in ${repoName}\n` );

  // iterate through all translated string files for repoName in babel
  const files = fs.readdirSync( `./babel/${repoName}` );

  files.forEach( fileName => {

    const translatedStringsFileName = `./babel/${repoName}/${fileName}`;
    const translatedStringsData = JSON.parse( fs.readFileSync( translatedStringsFileName, 'utf8' ) );

    for ( const key in translatedStringsData ) {
      !stringKeys.includes( key ) && delete translatedStringsData[ key ];
    }

    console.log( `writing new file: ${fileName}` );
    fs.writeFileSync( translatedStringsFileName, JSON.stringify( translatedStringsData, null, 2 ) );
  } );

} );