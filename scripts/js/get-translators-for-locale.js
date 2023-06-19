// Copyright 2023, University of Colorado Boulder

/**
 * Script to list all translator IDs for the provided locale with the date of their most recent submission.  This was
 * created to support resolution of some problems with null user IDs, see
 * https://github.com/phetsims/rosetta/issues/412.
 *
 * Usage Example:
 *   node get-translators-for-locale de
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

const getStringFileListForLocale = require( './common/getStringFileListForLocale.js' );
const fs = require( 'fs' );

// constants
const USAGE_STRING = 'Usage: node get-translators-for-locale <locale>';

if ( process.argv.length !== 3 ) {
  console.log( USAGE_STRING );
  process.exit( 1 );
}

const locale = process.argv[ 2 ];
console.log( `Getting translator info for locale = ${locale}` );

// Get a list of all translations for the provided locale.
const translationFileList = getStringFileListForLocale( locale );

// Read each of these files and turn it into an object.
const translationObjects = translationFileList.map( fileName => {
  const fileContent = fs.readFileSync( fileName, 'utf-8' );
  return JSON.parse( fileContent );
} );

// This will be where the translator list will be placed.  This will be a list of objects with the user ID and the most
// recent timestamp, and there should only be one entry per user ID.
const translatorList = [];

translationObjects.forEach( translationObject => {
  for ( const stringKey in translationObject ) {
    if ( translationObject[ stringKey ].history ) {
      translationObject[ stringKey ].history.forEach( historyEntry => {
        const userId = historyEntry.userId;
        const timestamp = historyEntry.timestamp;
        const recordForThisUser = translatorList.find( item => item.userId === userId );
        if ( recordForThisUser ) {
          if ( recordForThisUser.mostRecentTimestamp < timestamp ) {

            // There is a more recent timestamp, so update our list.
            recordForThisUser.mostRecentTimestamp = timestamp;
          }
        }
        else {

          // There is no record for this user yet, so create one.
          translatorList.push( {
            userId: userId,
            mostRecentTimestamp: timestamp
          } );
        }
      } );
    }
    else {

      // Output a warning about there being no history for a particular key.  This can happen when examining a
      // translation that was auto-converted from the Java strings, so it's not a problem really, but the user should
      // be make aware of it.
      console.warn( `No history for stringKey = ${stringKey}` );
    }
  }
} );

console.log( 'Translator Info:' );
translatorList.forEach( translatorRecord => {
  console.log( '---------------------' );
  console.log( `translatorRecord.userId = ${translatorRecord.userId}` );
  const dateOfMostRecentEntry = new Date( translatorRecord.mostRecentTimestamp );
  console.log( `dateOfMostRecentEntry = ${dateOfMostRecentEntry}` );
} );