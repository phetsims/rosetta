// Copyright 2023, University of Colorado Boulder

/**
 * Script to find all translation files that have at least one null user ID but not ALL null user IDs and then replace
 * the null values with the user ID of the most recent contributor to the file.  This was created to support resolution
 * of some problems with null user IDs, see https://github.com/phetsims/rosetta/issues/412.
 *
 * Usage Example:
 *   node replace-null-user-ids-with-most-recent
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

const getTranslatedStringFileList = require( './common/getTranslatedStringFileList.js' );
const fs = require( 'fs' );

// constants
const USAGE_STRING = 'Usage: node replace-null-user-ids-with-most-recent';

if ( process.argv.length !== 2 ) {
  console.log( USAGE_STRING );
  process.exit( 1 );
}

// Get a list of all translations files.
const translationFileList = getTranslatedStringFileList();

// Go through all translation files, examine the user IDs that exist within, and for those files with one or more null
// user IDs and one or more non-null user IDs, make a list of the user IDs and the time of their most recent
// contribution.
const identifiedFiles = new Map();

translationFileList.forEach( translationFile => {
  const fileContent = fs.readFileSync( translationFile, 'utf-8' );
  const stringsObject = JSON.parse( fileContent );
  let containsAtLeastOneNullUserId = false;
  let containsAtLeastOneNonNullUserId = false;
  const userIdInfoList = [];
  for ( const stringKey in stringsObject ) {
    const history = stringsObject[ stringKey ].history;

    // History isn't always available, since long ago a number of string files were automatically converted from
    // older Java versions of the sim, so we have to check.
    if ( history ) {
      history.forEach( historyEntry => {
        const userId = historyEntry.userId;

        if ( userId === null ) {
          containsAtLeastOneNullUserId = true;
        }
        else if ( typeof historyEntry.userId === 'number' ) {
          containsAtLeastOneNonNullUserId = true;
        }

        const userIdInfo = userIdInfoList.find( userIdInfoListItem => userIdInfoListItem.userId === userId );
        if ( userIdInfo ) {
          if ( userIdInfo.mostRecentTimestamp < historyEntry.timestamp ) {
            userIdInfo.mostRecentTimestamp = historyEntry.timestamp;
          }
        }
        else {

          // Create a new entry in the user ID info list for this user.
          userIdInfoList.push( { userId: userId, mostRecentTimestamp: historyEntry.timestamp } );
        }
      } );
    }
  }

  // If this file meets our criteria, map its name to an object that we will need later to fix it up.
  if ( containsAtLeastOneNullUserId && containsAtLeastOneNonNullUserId ) {
    identifiedFiles.set( translationFile, { stringsObject: stringsObject, userIdInfoList: userIdInfoList } );
  }
} );

identifiedFiles.forEach( ( fileAnalysisInfo, fileName ) => {

  console.log();

  // Output the translation file name.
  const simFileName = fileName.substring( fileName.lastIndexOf( '/' ) + 1 );
  console.log( `Translation file name = ${simFileName}\n` );

  const userIdInfoList = fileAnalysisInfo.userIdInfoList;

  // Sort the user IDs so that the most recent to make a contribution is at the top.
  userIdInfoList.sort( ( a, b ) => b.mostRecentTimestamp - a.mostRecentTimestamp );

  // Print the user IDs and time of most recent contribution in human-readable format.
  userIdInfoList.forEach( userIdInfo => {
    console.log( `  userId = ${userIdInfo.userId}` );
    const date = new Date( userIdInfo.mostRecentTimestamp );
    console.log( `  most recent contribution time = ${date}` );
    console.log();
  } );

  // Find the most recent non-null user ID.
  const mostRecentNonNullUserId = userIdInfoList.find( info => info.userId !== null ).userId;

  console.log( `  Replacing null user IDs with ${mostRecentNonNullUserId}` );

  // Go through all history entries in this file and replace null user IDs with the most recent contributor.
  for ( const stringKey in fileAnalysisInfo.stringsObject ) {
    const history = fileAnalysisInfo.stringsObject[ stringKey ].history;
    history.forEach( historyEntry => {
      if ( historyEntry.userId === null ) {
        historyEntry.userId = mostRecentNonNullUserId;
      }

    } );
  }

  // Write the updated file.
  fs.writeFileSync( fileName, JSON.stringify( fileAnalysisInfo.stringsObject, null, 2 ) );
} );