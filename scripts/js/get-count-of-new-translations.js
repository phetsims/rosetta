// Copyright 2024, University of Colorado Boulder

/**
 * This file defines a NodeJS script that will provide a count of the new translations that have been submitted between
 * two dates.  See https://github.com/phetsims/rosetta/issues/428 for some history.
 *
 * This assumes that the babel and perennial repos are checked out locally and adjacent to this repo.
 *
 * USAGE:
 *
 *   node get-count-of-new-translations
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

// imports
const fs = require( 'fs' );
const os = require( 'os' );
const child_process = require( 'child_process' );

// Start and end dates, alter as needed.
const START_DATE = '2023-01-01T00:00:00Z';
const END_DATE = '2024-01-01T00:00:00Z';

// Create the command that will be used to get the set of new files.  I (jbphet) tried doing this through the GitHub
// API, but it was turning out to be challenging, and this was a 1-hour effort, so I had to fall back to the command
// line.  The "diff-filter=A" bit is used to identify files that were added.
const gitLogCommand = `git log --pretty=oneline --diff-filter=A --since=${START_DATE} --until=${END_DATE}`;

// Get a list of commits of new files into babel using the log command.
let logCommandOutput;
try {
  const initialDirectory = process.cwd();
  process.chdir( '../../../babel' );
  logCommandOutput = child_process.execSync( gitLogCommand );
  process.chdir( initialDirectory );
}
catch( e ) {
  console.error( `Error trying to get list of added files: ${e}` );
  process.exit( 1 );
}

// Split the log messages into an array.  *NOTE* : The os.EOL constant didn't work in Windows for this, perhaps because
// the output of commands is different from file reads.  If you're having trouble running this, you might want to see
// what line endings are here.  I (jbphet) got snagged by this.
const logMessages = logCommandOutput.toString().split( '\n' );

// Read the list of active sims.
let activeSimList;
try {
  const initialDirectory = process.cwd();
  activeSimList = fs.readFileSync( '../../../perennial-alias/data/active-sims', 'utf-8' );
  process.chdir( initialDirectory );
}
catch( e ) {
  console.error( `Error trying to get list of active sims: ${e}` );
  process.exit( 1 );
}

// Put the list of active sims into an array.
const activeSims = activeSimList.split( os.EOL ).filter( name => name.length > 0 );

const logMessageIsForActiveSim = logMessage => {
  let isForActiveSim = false;
  for ( const activeSim of activeSims ) {
    if ( logMessage.includes( activeSim ) ) {
      isForActiveSim = true;
      break;
    }
  }
  return isForActiveSim;
};

// Filter out any of the GitHub log lines that don't include an active sim.  This gets rid of commits that are for
// common-code repos.
const logMessagesForActiveSims = logMessages.filter( logMessage => logMessage.length > 2 && logMessageIsForActiveSim( logMessage ) );

// Output a list of log messages for the sims.
console.log( 'Log messages for the creation of new sim translations, most recent first:' );
logMessagesForActiveSims.forEach( ( logMessageForActiveSim, index ) => {
  console.log( `log msg ${index}: ${logMessageForActiveSim}` );
} );

console.log( '\n' );
console.log( `Number of new sim translations for the specified date range = ${logMessagesForActiveSims.length}.` );