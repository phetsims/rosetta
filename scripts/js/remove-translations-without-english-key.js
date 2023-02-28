// Copyright 2022, University of Colorado Boulder

/**
 * NodeJS script for removing translated string keys in babel files that are not in the english strings.
 * This looks at the en json, and will remove any keys in babel translated files that are not in the en string files.
 * Be careful, this is an atypical script that has only yet been useful when a sim is split into a mini-suite with a
 * common repo (number-suite-common,solar-system-common).
 *
 * Good luck!
 *
 * usage:
 * cd root/
 * node rosetta/scripts/js/remove-translations-without-english-key.js my-repo
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

// modules
const fs = require( 'fs' );
const assert = require( 'assert' );

const repoName = process.argv[ 2 ];

assert( typeof repoName === 'string', 'repo arg required' );

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

    if ( !enStringKeys.includes( key ) ) {
      console.log( 'deleting', key, fileName );
      delete translatedStrings[ key ];
    }
  }

  assert( Object.keys( translatedStrings ).length <= enStringKeys.length, 'something went wrong, there are too many translated keys.' );

  console.log( `writing new file: ${fileName}` );
  fs.writeFileSync( translatedStringsFileName, JSON.stringify( translatedStrings, null, 2 ) );
} );