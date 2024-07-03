// Copyright 2024, University of Colorado Boulder

/**
 * NodeJS script that extracts the English strings from a published sim and prints them to the console.
 *
 * Usage Example:
 *   node get-english-strings-for-sim build-an-atom
 *
 * Because of the way Windows handles NodeJS, Windows users can sometimes get the error "stdout is not a tty" when
 * attempting to redirect the output of this script or pipe it to another command.  In that case, the "command" command
 * (apologies for the tortured sentence structure, but what is one to do?) can be used.  Here's an example:
 *
 *   command node get-english-strings-for-sim.js center-and-variability > temp.txt
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// imports
const getStringsFromSim = require( './common/getStringsFromSim.js' );

// constants
const USAGE_STRING = 'Usage: node get-english-strings-for-sim <sim-repo-name>';

if ( process.argv.length !== 3 ) {
  console.log( USAGE_STRING );
  process.exit( 1 );
}

const simRepoName = process.argv[ 2 ];

// Wrap the main contents of the script in an async block so that async/await syntax can be used.
( async () => {
  const simUrl = `https://phet.colorado.edu/sims/html/${simRepoName}/latest/${simRepoName}_all.html`;
  const strings = await getStringsFromSim( simUrl );
  console.log( `strings = ${JSON.stringify( strings.en, null, 2 )}` );
} )();