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

import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

// I got this list from the output of
// rosetta/scripts/sh/find-babel-files-changed-since-date.sh.
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
  'vegas/vegas-strings_pl.json '
];
const BABEL_SHA_BEFORE_ROSETTA_2_DEPLOY = 'e633cf8be7d90fca65e81108e936abcd7ede38cf';
const BABEL_SHA_CURRENT = '017dda0adb2375f55fb57ebf77aebebc5208ee17';

const cdToBabel = () => {
  const pathToBabel = join( '..', 'babel' );
  process.chdir( pathToBabel );
};

const checkout = sha => {
  execSync( `git checkout ${sha} --quiet` );
};

const cat = path => {
  return execSync( `cat ${path}`, { encoding: 'utf-8' } );
};

const getFileContents = path => {
  let contents = '{"dne": "file contents did not exist at this sha"}';
  if ( existsSync( path ) ) {
    contents = cat( path );
  }
  return contents;
};

const PATHS_MAPPED_TO_FILE_CONTENTS = {};

console.log( 'starting add removed strings script' );
console.log( `current working directory is ${process.cwd()}` )
console.log( 'attempting to cd to babel' );
cdToBabel();
console.log( `current working directory is ${process.cwd()}` )

for ( const path of PATHS_OF_CHANGED_FILES ) {
  PATHS_MAPPED_TO_FILE_CONTENTS[ path ] = {};
  checkout( BABEL_SHA_BEFORE_ROSETTA_2_DEPLOY );
  PATHS_MAPPED_TO_FILE_CONTENTS[ path ].before = JSON.parse( getFileContents( path ) );
  checkout( BABEL_SHA_CURRENT );
  PATHS_MAPPED_TO_FILE_CONTENTS[ path ].current = JSON.parse( getFileContents( path ) );
}

console.log( `----------> PATHS_MAPPED_TO_FILE_CONTENTS = ${JSON.stringify( PATHS_MAPPED_TO_FILE_CONTENTS, null, 4 )}` );