// Copyright 2022, University of Colorado Boulder

/**
 * NodeJS script for removing strings that are duplicated in babel subdirectories.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 * TODO: This is under development for https://github.com/phetsims/number-suite-common/issues/27
 */

/* eslint-env node */

// modules
const fs = require( 'fs' );
// const _ = require( 'lodash' ); // eslint-disable-line require-statement-match

const REPOS_WITH_STRING_DUPLICATES = [
  'number-play',
  'number-compare',
  'number-suite-common'
];

REPOS_WITH_STRING_DUPLICATES.forEach( repoName => {

  // read the string file and turn it into an object
  const jsonFile = fs.readFileSync( `./${repoName}/${repoName}-strings_en.json`, 'utf8' );
  const stringKeys = Object.keys( JSON.parse( jsonFile ) );

  // console.log( stringKeys );

  // iterate through all translated string files for repoName in babel
  const files = fs.readdirSync( `./babel/${repoName}` );

  // files.forEach( fileName => {
  for ( let i = 0; i < 1; i++ ) {
    const fileName = files[ i ];

    console.log( fileName );
    const translatedJsonFile = fs.readFileSync( `./babel/${repoName}/${fileName}`, 'utf8' );
    const translatedStrings = JSON.parse( translatedJsonFile );

    console.log( Object.keys( translatedStrings ) );

    for ( const key in translatedStrings ) {
      if ( !stringKeys.includes( key ) ) {
        console.log( `${key} not found in ${repoName}` );
      }
    }
  }
  // } );

} );

// allKeys = _.flatten( allKeys );
// console.log( allKeys );

// if ( _.uniq( allKeys ).length === allKeys.length ) {
//   console.log( 'no duplicates found' );
// }
// else {
//   console.log( 'you fucked up' );
// }