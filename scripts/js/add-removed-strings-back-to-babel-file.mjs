// Copyright 2023, University of Colorado Boulder

/**
 * In https://github.com/phetsims/rosetta/issues/378, we discovered Rosetta
 * was removing strings that were translated but not used in the sim being
 * translated. Thus, there were many translations from February 21st, 2023
 * to February 28th, 2023 that erroneously removed strings that were
 * translated. This script identifies the strings that were erroneously
 * removed and adds them back to the Babel file where they once were.
 *
 * For more info, see https://github.com/phetsims/rosetta/issues/380.
 *
 * NOTE 1: This script is meant to be run from the root of the Rosetta
 * directory.
 *
 * NOTE 2: This script assumes a Unix-like environment. Don't try to run
 * this in command prompt on Windows. If you're on Windows, use Git Bash
 * or something that provides a more Unix-y environment.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const DID_NOT_EXIST_OBJECT = {
  dne: 'file contents did not exist at this sha'
};
const PATHS_OF_CHANGED_FILES = [
  'acid-base-solutions/acid-base-solutions-strings_pl.json',
  'acid-base-solutions/acid-base-solutions-strings_sr.json',
  'area-builder/area-builder-strings_pl.json',
  'area-model-common/area-model-common-strings_pl.json',
  'arithmetic/arithmetic-strings_pl.json',
  'atomic-interactions/atomic-interactions-strings_ku.json',
  'beers-law-lab/beers-law-lab-strings_pl.json',
  'beers-law-lab/beers-law-lab-strings_pt_BR.json',
  'bending-light/bending-light-strings_pl.json',
  'build-a-molecule/build-a-molecule-strings_mk.json',
  'build-an-atom/build-an-atom-strings_mk.json',
  'center-and-variability/center-and-variability-strings_rw.json',
  'chains/chains-strings_ab.json',
  'energy-skate-park/energy-skate-park-strings_pl.json',
  'fractions-common/fractions-common-strings_pl.json',
  'greenhouse-effect/greenhouse-effect-strings_sr.json',
  'joist/joist-strings_ku.json',
  'joist/joist-strings_mk.json',
  'joist/joist-strings_pl.json',
  'joist/joist-strings_pt_BR.json',
  'joist/joist-strings_rw.json',
  'joist/joist-strings_sr.json',
  'scenery-phet/scenery-phet-strings_ku.json',
  'scenery-phet/scenery-phet-strings_mk.json',
  'scenery-phet/scenery-phet-strings_pl.json',
  'scenery-phet/scenery-phet-strings_pt_BR.json',
  'scenery-phet/scenery-phet-strings_rw.json',
  'scenery-phet/scenery-phet-strings_sr.json',
  'shred/shred-strings_mk.json',
  'states-of-matter/states-of-matter-strings_ku.json',
  'states-of-matter/states-of-matter-strings_pl.json',
  'trig-tour/trig-tour-strings_pl.json',
  'vegas/vegas-strings_mk.json',
  'vegas/vegas-strings_pl.json'
];
const PATHS_MAPPED_TO_FILE_CONTENTS = {};
const BABEL_SHA_BEFORE_ROSETTA_2_DEPLOY = 'e633cf8be7d90fca65e81108e936abcd7ede38cf';
const BABEL_SHA_CURRENT = 'master';

const cd = dir => {
  const path = join( '..', dir );
  process.chdir( path );
};

const checkout = shaOrBranch => {
  execSync( `git checkout ${shaOrBranch} --quiet` );
};

const pull = () => {
  execSync( 'git pull --quiet' );
};

const cat = path => {
  return execSync( `cat ${path}`, { encoding: 'utf-8' } );
};

const getFileContents = path => {
  let contents = DID_NOT_EXIST_OBJECT;
  if ( existsSync( path ) ) {
    contents = JSON.parse( cat( path ) );
  }
  return contents;
};

const printPathAndMessage = ( path, message ) => {
  const width = 120;
  console.log( '='.repeat( width ) );
  console.log( path );
  console.log( message );
};

console.log( 'info: starting add removed strings script' );
console.log( `info: current working directory is ${process.cwd()}` );
console.log( 'info: attempting to cd to babel' );
cd( 'babel' );
console.log( `info: current working directory is ${process.cwd()}` );

// Get the file contents for each path before Rosetta 2.0's deployment
// and their current contents.
for ( const path of PATHS_OF_CHANGED_FILES ) {
  PATHS_MAPPED_TO_FILE_CONTENTS[ path ] = {};
  checkout( BABEL_SHA_BEFORE_ROSETTA_2_DEPLOY );
  PATHS_MAPPED_TO_FILE_CONTENTS[ path ].before = getFileContents( path );
  checkout( BABEL_SHA_CURRENT );
  PATHS_MAPPED_TO_FILE_CONTENTS[ path ].current = getFileContents( path );
}

// In this loop, we create an object that contains the contents of
// each file before Rosetta 2.0's deployment, their current file contents,
// and the fixed up file contents (i.e. the old contents plus the stuff
// that was added between the deployment and now).
for ( const path of Object.keys( PATHS_MAPPED_TO_FILE_CONTENTS ) ) {

  const beforeObj = PATHS_MAPPED_TO_FILE_CONTENTS[ path ].before;
  const currentObj = PATHS_MAPPED_TO_FILE_CONTENTS[ path ].current;

  // Set up booleans.
  const fileContentsDidNotExistBefore = beforeObj === DID_NOT_EXIST_OBJECT;
  const fileContentsDoNotExistCurrent = currentObj === DID_NOT_EXIST_OBJECT;

  if ( fileContentsDidNotExistBefore ) {
    printPathAndMessage( path, 'file contents did not exist before' );
  }
  else if ( fileContentsDoNotExistCurrent ) {

    // I don't think this should ever be logged.
    printPathAndMessage( path, 'file contents do not exist currently' );
  }
  else {

    const beforeKeys = Object.keys( beforeObj );
    const beforeLen = beforeKeys.length;
    const currentKeys = Object.keys( currentObj );
    const currentLen = currentKeys.length;

    if ( beforeLen === currentLen ) {

      // This is kind of strange. We should check the file.
      printPathAndMessage( path, 'keys are the same' );
    }
    else if ( beforeLen < currentLen ) {

      // This is normal, but we should double-check the file just in case.
      printPathAndMessage( path, 'before keys less than current keys' );
    }
    else if ( beforeLen > currentLen ) {

      // This is bad. Keys were probably erroneously deleted.
      printPathAndMessage( path, 'before keys greater than current keys' );
    }

    // Create a fixed object, which is the before object plus whatever keys were
    // added in the meantime.
    console.log( '  setting the fixed object to be the before object' );
    PATHS_MAPPED_TO_FILE_CONTENTS[ path ].fixed = beforeObj;
    for ( const key of currentKeys ) {
      const keyWasAdded = !beforeKeys.includes( key );
      const valueIsSame = beforeObj[ key ] ? beforeObj[ key ].value === currentObj[ key ].value : false;
      const stringObjectWasChanged = !isDeepStrictEqual( beforeObj[ key ], currentObj[ key ] );
      if ( keyWasAdded ) {
        console.log( `    key ${key} was added recently, adding its string object to the fixed object` );
        PATHS_MAPPED_TO_FILE_CONTENTS[ path ].fixed[ key ] = PATHS_MAPPED_TO_FILE_CONTENTS[ path ].current[ key ];
      }
      else if ( valueIsSame ) {
        console.log( `    value for ${key} is the same as the original; adding back original` );
        PATHS_MAPPED_TO_FILE_CONTENTS[ path ].fixed[ key ] = PATHS_MAPPED_TO_FILE_CONTENTS[ path ].before[ key ];
      }
      else if ( stringObjectWasChanged ) {
        console.log( `    the string object contents associated with ${key} were changed, adding them` );

        // We need to make a new object here with a history array, etc.

        const oldHistoryArray = beforeObj[ key ].history;
        const mostRecentIndex = oldHistoryArray ? oldHistoryArray.length - 1 : null;

        // Populate history entry.
        const newHistoryEntry = {
          userId: oldHistoryArray ? oldHistoryArray[ mostRecentIndex ].userId : null, // Use the most recent user ID.
          timestamp: Date.now(),
          oldValue: beforeObj[ key ].value,
          newValue: currentObj[ key ].value,
          explanation: 'Changed by a script. Part of https://github.com/phetsims/rosetta/issues/380.'
        };

        // Create history array.
        let newHistoryArray = [];
        if ( oldHistoryArray ) {
          console.log( '      old history array present; adding to it' );
          newHistoryArray = oldHistoryArray.concat( [ newHistoryEntry ] );
        }
        else {
          console.log( '      old history array undefined; creating new one' );
          newHistoryArray = [ newHistoryEntry ];
        }

        // Create the new string object.
        PATHS_MAPPED_TO_FILE_CONTENTS[ path ].fixed[ key ] = {
          value: currentObj[ key ].value,
          history: newHistoryArray
        };
      }
    }
  }
}

// Checkout the master branch of phetsims/babel, then pull, then write files.
const SHOULD_WRITE_FILES = true;
if ( process.cwd().includes( 'babel' ) ) {
  console.log( 'info: cwd includes babel' );
  console.log( 'info: checking out master branch' );
  checkout( 'master' );
  console.log( 'info: checked out master branch' );
  console.log( 'info: pulling latest changes' );
  pull();
  console.log( 'info: pulled latest changes' );
  for ( const path of PATHS_OF_CHANGED_FILES ) {
    if ( PATHS_MAPPED_TO_FILE_CONTENTS[ path ] && PATHS_MAPPED_TO_FILE_CONTENTS[ path ].fixed ) {
      if ( SHOULD_WRITE_FILES ) {
        writeFileSync( path, JSON.stringify( PATHS_MAPPED_TO_FILE_CONTENTS[ path ].fixed, null, 2 ) );
      }
      console.log( `file written for: ${path}` );
    }
    else {
      console.log( `info: file contents did not exist for ${path}` );
    }
  }
}
else {
  console.log( 'info: cwd does not include babel; not writing anything' );
}