// Copyright 2022, University of Colorado Boulder

/**
 * This file defines a NodeJS script that interprets a CSV file representation of the saved_translations table of the
 * PhET postgreSQL DB and converts the rows into correctly formatted string files.  This was created in order to recover
 * some translations that were stored there when we cut over from Rosetta 1 to Rosetta 2 in early 2023.  See
 * https://github.com/phetsims/rosetta/issues/389.
 *
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

/* eslint-disable */
// TODO: Remove the directive to disable lint and make sure this passes.  Just didn't want to risk breaking things.

// imports
const fs = require( 'fs' );
const unixTimestamp = require( 'unix-timestamp' );

// constants
const USAGE_STRING = 'Usage: node db-records-to-string-files <path-to-db-data> <locale>';

if ( process.argv.length !== 4 ) {
  console.log( USAGE_STRING );
  process.exit( 1 );
}

const inputFileName = process.argv[ 2 ];
const locale = process.argv[ 3 ];

console.log( `Extracting string info from ${inputFileName} for locale ${locale}` );

// Read in the specified file.
const fileContents = fs.readFileSync( inputFileName, { encoding: 'utf8', flag: 'r' } );

// Split the file into lines.
const fileLines = fileContents.split( '\n' );

// Extract all string records for the specified locale into a set of objects.
const stringRecords = [];
fileLines.forEach( line => {
  if ( line.includes( `,${locale},` ) ) {

    const fieldsFromStringRecord = line.split( ',' );
    const stringRecord = {
      userID: Number( fieldsFromStringRecord[ 0 ] ),
      stringKey: fieldsFromStringRecord[ 1 ],
      repoName: fieldsFromStringRecord[ 2 ],
      locale: fieldsFromStringRecord[ 3 ],
      translatedStringValue: fieldsFromStringRecord[ 4 ],
      timeString: fieldsFromStringRecord[ 5 ]
    };
    if ( stringRecord.locale !== locale ) {
      throw new Error( 'Locales did not match, something is amiss.' );
    }
    stringRecords.push( stringRecord );
  }
} );

// Create an object that contains all translated strings for each repo.
const translatedStrings = {};
stringRecords.forEach( stringRecord => {

  // If there is no entry for this repo yet, create one.
  if ( !translatedStrings.hasOwnProperty( stringRecord.repoName ) ) {
    translatedStrings[ stringRecord.repoName ] = {};
  }

  // Create and add an entry for this string.
  translatedStrings[ stringRecord.repoName ][ stringRecord.stringKey ] = {
    value: stringRecord.translatedStringValue,
    history: [
      {
        userId: stringRecord.userID,
        timestamp: Math.floor( unixTimestamp.fromDate( stringRecord.timeString ) * 1000 ),
        oldValue: '',
        newValue: stringRecord.translatedStringValue
      }
    ]
  };
} );

console.log( `translatedStrings = ${JSON.stringify( translatedStrings, null, 2 )}` );
fs.writeFileSync( './string-info.json', JSON.stringify( translatedStrings, null, 2 ) );