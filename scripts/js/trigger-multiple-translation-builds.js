// Copyright 2022, University of Colorado Boulder

/**
 * This file defines a NodeJS script that can be used to trigger multiple simulation builds.  This is helpful when there
 * are a lot of builds to be done and it would be too time-consuming to do them all through the UI.  See
 * https://github.com/phetsims/rosetta/issues/389.
 *
 *
 * Usage Example:
 *   node trigger-multiple-translation-builds
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// imports
const fs = require( 'fs' );
const axios = require( 'axios' );

// constants
const INTER_BUILD_DELAY = 360; // in seconds
const LOCALE = 'az';
const SIM_LIST = [
  'equality-explorer',
  'expression-exchange',
  'fraction-matcher',
  'fractions-equality',
  'fractions-intro',
  'fractions-mixed-numbers',
  'function-builder-basics',
  'function-builder',
  'gas-properties',
  'gene-expression-essentials',
  'geometric-optics',
  'graphing-lines',
  'graphing-quadratics',
  'graphing-slope-intercept',
  'gravity-force-lab-basics',
  'greenhouse-effect',
  'make-a-ten',
  'molecules-and-light',
  'natural-selection',
  'neuron',
  'normal-modes',
  'number-line-distance',
  'number-line-integers',
  'number-line-operations',
  'proportion-playground',
  'ratio-and-proportion',
  'trig-tour',
  'unit-rates',
  'vector-addition-equations',
  'waves-intro',
  'circuit-construction-kit-dc',
  'color-vision',
  'gravity-and-orbits',
  'gravity-force-lab',
  'states-of-matter',
  'wave-interference'
];

/**
 * Helper function to get the user ID for the most recent change of this file.
 */
const getMostRecentUserId = ( simName, locale ) => {
  const stringFileName = `${simName}-strings_${locale}.json`;
  const stringFilePath = `../../../babel/${simName}/${stringFileName}`;
  let stringInfo;
  try {
    stringInfo = JSON.parse( fs.readFileSync( stringFilePath, { encoding: 'utf8', flag: 'r' } ) );
  }
  catch( e ) {
    console.error( `Strings file not found: ${stringFilePath}, aborting` );
    process.exit( 1 );
  }

  let userId;
  let highestTimestampFound = 0;
  for ( const stringKey in stringInfo ) {
    const history = stringInfo[ stringKey ].history;
    const lastHistoryEntry = history[ history.length - 1 ];
    if ( lastHistoryEntry.timestamp > highestTimestampFound ) {
      highestTimestampFound = lastHistoryEntry.timestamp;
      userId = lastHistoryEntry.userId;
    }
  }

  if ( !userId ) {
    console.error( `No userId recovered for sim ${simName}, locale ${locale}` );
    process.exit( 1 );
  }

  return userId;
};

/**
 * Helper function to that can be used to pause the action in the script.
 */
const delay = seconds => {
  return new Promise( resolve => setTimeout( resolve, seconds * 1000 ) );
};

// Wrap the main contents of the script in an async block so that async/await syntax can be used.
( async () => {

  // Iterate through the list of sims and submit build requests for each.
  for ( let i = 0; i < SIM_LIST.length; i++ ) {
    const simName = SIM_LIST[ i ];
    const userId = getMostRecentUserId( simName, LOCALE );
    console.log( `\nRequesting build for sim ${i + 1} of ${SIM_LIST.length}` );
    console.log( `sim = ${simName}, locale = ${LOCALE}, and userId = ${userId}` );
    const buildRequestUrl = `https://phet.colorado.edu/translate/api/triggerBuild/${simName}/${LOCALE}/${userId}`;
    console.log( `buildRequestUrl = ${buildRequestUrl}` );
    let response;
    try {
      response = await axios.get( buildRequestUrl );
    }
    catch( err ) {
      console.log( `  Error when requesting build: ${err}, aborting.` );
      process.exit( 1 );
    }
    if ( response ) {
      console.log( `  response.status = ${response.status}` );
      console.log( `  response.data = ${JSON.stringify( response.data )}` );
    }

    // Delay between each request so as not to overwhelm the build server.
    if ( i < SIM_LIST.length - 1 ) {
      await delay( INTER_BUILD_DELAY );
    }
  }
} )();