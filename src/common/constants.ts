// Copyright 2023, University of Colorado Boulder

/**
 * Define constants used throughout Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import publicConfig from './publicConfig.js';

// TODO: See https://github.com/phetsims/rosetta/issues/395.  If all sims are re-published off of main at some point
//       after May 2023, then this constant is obsolete, and the code associated with it can be removed.
// Specifically, see this comment: https://github.com/phetsims/rosetta/issues/395#issuecomment-1536705532.
// Define a value that indicates that a string is no longer used. It's
// possible that a sim could have a string "no longer used", so I
// (Liam Mulhall) added a nonsense word "gooble". The primary purpose of
// this constant is to strip out strings that were once used for accessibility like
// SCENERY_PHET/ResetAllButton.name or JOIST/HomeButton.name. These
// strings are present in some older sim publications, but not in the
// main version of their string file(s). Now, all accessibility strings
// are prefixed with a11y.
export const NO_LONGER_USED_FLAG = 'no longer used gooble';

export const TRANSLATION_API_ROUTE = publicConfig.ENVIRONMENT === 'development' ?
                                     'http://localhost:16372/translate/api' :
                                     '/translate/api';

// These are used in validating the user input for strings that
// have placeholder patterns.
export const SINGLE_BRACE_REGEX = /\{\d+\}/g;
export const DOUBLE_BRACE_REGEX = /\{\{\w+\}\}/g;
export const TRIPLE_BRACE_REGEX = /\{\{\{\w+\}\}\}/g;

// Type for the information about unpublished sims that we want to include in the list of translatable sims.
export type UnpublishedSimInfo = {

  // kebab-case name of the sim, e.g. 'membrane-transport'
  name: string;

  // title of the sim, e.g. 'Membrane Transport'
  title: string;

  // URL where the sim resources for the phet build can be found, including the en_phet.html file, the string map, and
  // the dependencies file.  Examples include:
  //   - https://phet-dev.colorado.edu/html/membrane-transport/1.0.0-dev.10/phet/ for a published dev version
  //   - http://localhost:8080/membrane-transport/build/phet/ for a local build
  simResourceUrl: string;
};

// List of unpublished sims that we want to include in the list of translatable sims.
export const UNPUBLISHED_SIMS_TO_INCLUDE: UnpublishedSimInfo[] = [
  {
    name: 'membrane-transport',
    title: 'Membrane Transport',
    simResourceUrl: 'https://phet-dev.colorado.edu/html/membrane-transport/1.0.0-dev.10/phet/'
  }
];

// List of the sims included in the short report, which is used for debugging.
export const SIMS_FOR_SHORT_REPORT = [

  // Any unpublished sims that are specified for inclusion are also included in the short report.
  ...UNPUBLISHED_SIMS_TO_INCLUDE.map( simInfo => simInfo.name ),

  // sim often used for testing because it is first in alphabetical order
  'acid-base-solutions',

  // sim with lots of translations
  'build-an-atom',

  // sim that tends to have fewer translations
  // 'quadrilateral',

  // Include atomic-interactions and states-of-matter because the former shares most strings with the latter, so this
  // allows us to test the behavior of 'shared' strings.
  'states-of-matter',
  'atomic-interactions',

  // chains and example-sim are omitted as of Jan 9 2024 because there aren't published string map files for them
  'chains'
  // 'example-sim'
];