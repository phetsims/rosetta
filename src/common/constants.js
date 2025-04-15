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

// This is the object in the published sim HTML that contains the REPO_NAME/stringKey pairs.
export const STRING_KEYS_WITH_REPO_NAME_IN_HTML_VAR = 'window.phet.chipper.strings';

// List of the sims included in the short report, which is used for debugging.
export const SIMS_FOR_SHORT_REPORT = [

  // sim often used for testing because it is first in alphabetical order
  'acid-base-solutions',

  // sim with lots of translations
  'build-an-atom',

  // sim that tends to have fewer translations
  'quadrilateral',

  // sim often used for testing
  'molecules-and-light'

  // chains and example-sim are omitted as of Jan 9 2024 because there aren't published string map files for them
  // 'chains',
  // 'example-sim'
];