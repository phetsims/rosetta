// Copyright 2023, University of Colorado Boulder

/**
 * Define constants used throughout Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import publicConfig from './publicConfig.js';

// Define a value that indicates that a string is no longer used.
// It's possible that a sim could have a string "no longer used",
// so I added a nonsense word "gooble".
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