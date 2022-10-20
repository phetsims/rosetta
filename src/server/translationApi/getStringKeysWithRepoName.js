// Copyright 2021, University of Colorado Boulder

/**
 * Export a function that gets ordered pairs of repo name and string key from a sim's HTML.
 *
 * @author Liam Mulhall
 */

import config from '../../common/config.js';
import logger from './logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a REPO_NAME/stringKey string. These strings are extracted
 * from a sim's production HTML.
 *
 * @param {Object} simHtml - sim HTML
 * @returns {String[]} - list of REPO_NAME/stringKey from the sim TODO update this to reflect object being returned
 */
const getStringKeysWithRepoName = simHtml => {

  logger.info( 'getting string keys with repo name from sim html' );

  /*
  * As of this writing, there's a variable (window.phet.chipper.strings) in a script tag in the sim's HTML file that
  * contains a JavaScript object with locales. Each locale has keys that look like REPO_NAME/stringKey and values that
  * are the strings in the simulation. For example, in Atomic Interactions, the first key/value pair in the en (English)
  * locale is "ATOMIC_INTERACTIONS/atomic-interactions.title": "Atomic Interactions".
  *
  * This is what the variable looks like.
  *
  * window.phet.chipper.strings = {
  *   "en": {
  *     "REPO_NAME1/stringKey1": "string key 1 value",
  *     "REPO_NAME2/stringKey2": "string key 2 value",
  *     ...
  *   },
  *   ...
  * };
  *
  */
  const re = new RegExp( `${config.STRING_KEYS_WITH_REPO_NAME_IN_HTML_VAR}.*$`, 'm' );
  const stringKeysWithRepoNameAndRestOfHtml = simHtml.match( re );
  const unparsedStringKeysWithRepoName = stringKeysWithRepoNameAndRestOfHtml[ 0 ]
    .replace( `${config.STRING_KEYS_WITH_REPO_NAME_IN_HTML_VAR} = `, '' )
    .replace( /;$/m, '' );

  const parsedStringKeysWithRepoName = JSON.parse( unparsedStringKeysWithRepoName );

  logger.info( 'got string keys with repo name from sim html; returning them' );
  return parsedStringKeysWithRepoName.en;
};

export default getStringKeysWithRepoName;