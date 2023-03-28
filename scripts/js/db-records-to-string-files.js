// Copyright 2022, University of Colorado Boulder

/**
 * This file defines a NodeJS script that interprets a CSV file representation of the saved_translations table of the
 * PhET postgreSQL DB and converts the rows into correctly formatted string files.  This was created in order to recover
 * some translations that were stored there when we cut over from Rosetta 1 to Rosetta 2 in early 2023.  See
 * https://github.com/phetsims/rosetta/issues/389.
 *
 *
 * Usage Example:
 *   node db-records-to-string-files ~/recover-strings/rosetta_1_data.csv az ../../../babel
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

/* eslint-disable */
// TODO: Remove the directive to disable lint and make sure this passes.  Just didn't want to risk breaking things.

// imports
const fs = require( 'fs' );
const unixTimestamp = require( 'unix-timestamp' );

// constants
const USAGE_STRING = 'Usage: node db-records-to-string-files <path-to-db-data> <locale> <path-to-strings-repo>';

if ( process.argv.length !== 5 ) {
  console.log( USAGE_STRING );
  process.exit( 1 );
}

// Extract input parameters.
const inputFileName = process.argv[ 2 ];
const locale = process.argv[ 3 ];
const pathToStringsRepo = process.argv[ 4 ];

// Check input parameters.
if ( !fs.existsSync( inputFileName ) ) {
  console.log( `DB data file ${fileName} not found, aborting.` );
  process.exit( 1 );
}
if ( !fs.existsSync( pathToStringsRepo ) ) {
  console.log( `Strings directory ${pathToStringsRepo} not found, aborting.` );
  process.exit( 1 );
}
if ( locale.length !== 2 && locale.length !== 5 ) {
  console.log( `Invalid locale ${locale}, aborting.` );
  process.exit( 1 );
}

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
      userId: Number( fieldsFromStringRecord[ 0 ] ),
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

// Create an object that contains all translated strings for each repo.  The
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
        userId: stringRecord.userId,
        timestamp: Math.floor( unixTimestamp.fromDate( stringRecord.timeString ) * 1000 ),
        oldValue: '',
        newValue: stringRecord.translatedStringValue
      }
    ]
  };
} );

// Iterate through the translated strings extracted from the DB and compare them to those in the string files.  If any
// of the strings from the DB are newer or non-existent in the existing translations, make the necessary updates or
// additions.
for ( let repo in translatedStrings ) {
  console.log( `\nProcessing strings for repo = ${repo}` );

  // Create the string file name for this repo and locale.
  const stringFileName = `${repo}-strings_${locale}.json`;

  // Create the full path to the file name.
  const stringFilePath = `${pathToStringsRepo}/${repo}/${stringFileName}`;

  console.log( `  Checking for the existing of string file ${stringFilePath}.` );
  const stringsFromDB = translatedStrings[ repo ];

  // If the strings file for this repo and locale already exists, read it in, compare the data, and write it out with
  // any modifications that were made.
  if ( fs.existsSync( stringFilePath ) ) {

    console.log( `    String file ${stringFilePath} exists, checking if any of the DB data is newer.` );

    const existingStrings = JSON.parse( fs.readFileSync( stringFilePath, { encoding: 'utf8', flag: 'r' } ) );

    let numberOfUpdatedStrings = 0;
    let numberOfAddedStrings = 0;
    for ( let stringKey in stringsFromDB ) {
      if ( existingStrings[ stringKey ] === undefined ) {

        // This string does yet exist in the current strings file, so add it.
        console.log( `      Adding new string stringKey = ${stringKey}.` );

        existingStrings[ stringKey ] = stringsFromDB[ stringKey ];
        numberOfAddedStrings++;
      }
      else {

        // This string is present in the existing file, so only overwrite it if the data from the DB is different and
        // more recent.
        const existingStringValue = existingStrings[ stringKey ].value;
        const existingStringHistory = existingStrings[ stringKey ].history;
        const existingStringMostRecentTimestamp = existingStringHistory[ existingStringHistory.length - 1 ].timestamp;
        const dbStringValue = stringsFromDB[ stringKey ].value;
        const dbStringTimestamp = stringsFromDB[ stringKey ].history[ 0 ].timestamp;

        if ( dbStringValue !== existingStringValue && dbStringTimestamp > existingStringMostRecentTimestamp ) {

          console.log( `      Updating string ${stringKey}` );

          // The string value in the DB is an update versus the value in the existing strings file, so make an update.
          existingStrings[ stringKey ].value = dbStringValue;
          existingStrings[ stringKey ].history.push( {
            userId: stringsFromDB[ stringKey ].history[ 0 ].userId,
            timestamp: stringsFromDB[ stringKey ].history[ 0 ].timestamp,
            oldValue: existingStringValue,
            newValue: dbStringValue
          } );

          numberOfUpdatedStrings++;
        }
      }
    }
    console.log( `    numberOfAddedStrings = ${numberOfAddedStrings}` );
    console.log( `    numberOfUpdatedStrings = ${numberOfUpdatedStrings}` );
    if ( numberOfUpdatedStrings + numberOfAddedStrings ) {
      fs.writeFileSync( stringFilePath, JSON.stringify( existingStrings, null, 2 ) );
      console.log( `    Overwrote ${stringFilePath} with updated values.` );
    }
    else {
      console.log( '    No strings changed or added for this file, skipping.' );
    }
  }
  else {

    // The string information for this repo does not yet exist in the set of strings file, so create it.
    fs.writeFileSync( stringFilePath, JSON.stringify( translatedStrings[ repo ], null, 2 ) );
    console.log( `    Created new string file ${stringFilePath}.` );
  }
}
process.exit( 1 );

console.log( `translatedStrings = ${JSON.stringify( translatedStrings, null, 2 )}` );
fs.writeFileSync( './string-info.json', JSON.stringify( translatedStrings, null, 2 ) );