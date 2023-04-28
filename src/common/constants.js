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