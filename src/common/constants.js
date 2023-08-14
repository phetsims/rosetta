// Copyright 2023, University of Colorado Boulder

/**
 * Define constants used throughout Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import publicConfig from './publicConfig.js';

// TODO: If all sims are re-published off of main, then this constant is obsolete, and the code associated with it can be removed. See https://github.com/phetsims/rosetta/issues/395.
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

// This is the object in the published sim HTML that contains the REPO_NAME/stringKey pairs.
export const STRING_KEYS_WITH_REPO_NAME_IN_HTML_VAR = 'window.phet.chipper.strings';