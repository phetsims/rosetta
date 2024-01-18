// Copyright 2023, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */

const fs = require( 'fs' );

/**
 * Function to get the most recent user ID that committed changes to the strings for the given sim and locale.
 * @param {string} simName
 * @param {string} locale
 * @returns {number|null} user ID if found, null if not
 */
module.exports = function getMostRecentUserId( simName, locale ) {
  const stringFileName = `${simName}-strings_${locale}.json`;
  const stringFilePath = `../../../babel/${simName}/${stringFileName}`;
  let stringInfo;
  try {
    stringInfo = JSON.parse( fs.readFileSync( stringFilePath, { encoding: 'utf8', flag: 'r' } ) );
  }
  catch( e ) {
    console.error( `Strings file not found: ${stringFilePath}, unable to obtain user ID` );
    return null;
  }

  let userId;
  let highestTimestampFound = 0;
  for ( const stringKey in stringInfo ) {
    const history = stringInfo[ stringKey ].history;

    // History isn't always available, since long ago a number of string files were automatically converted from
    // older Java versions of the sim, so we have to check.
    if ( history ) {
      const lastHistoryEntry = history[ history.length - 1 ];
      if ( lastHistoryEntry.timestamp > highestTimestampFound ) {
        highestTimestampFound = lastHistoryEntry.timestamp;
        userId = lastHistoryEntry.userId;
      }
    }
  }

  if ( !userId ) {
    console.error( `No userId recovered for sim ${simName}, locale ${locale}` );
    return null;
  }

  return userId;
};