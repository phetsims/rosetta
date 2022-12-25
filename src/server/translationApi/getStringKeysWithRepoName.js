// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets ordered pairs of repo name and string key from a sim's HTML.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

/**
 * Return a list of ordered pairs where each ordered pair is a REPO_NAME/stringKey string. These strings are extracted
 * from a sim's production HTML.
 *
 * @param {Object} simHtml - sim HTML
 * @returns {Object} - object of REPO_NAME/stringKey: value
 */
const getStringKeysWithRepoName = simHtml => {


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
  let stringKeysWithRepoName = { error: 'unable to get string keys with repo name' };
  try {
    logger.info( 'getting string keys with repo name from sim html' );
    const re = new RegExp( `${privateConfig.STRING_KEYS_WITH_REPO_NAME_IN_HTML_VAR}.*$`, 'm' );
    const stringKeysWithRepoNameAndRestOfHtml = simHtml.match( re );
    const unparsedStringKeysWithRepoName = stringKeysWithRepoNameAndRestOfHtml[ 0 ]
      .replace( `${privateConfig.STRING_KEYS_WITH_REPO_NAME_IN_HTML_VAR} = `, '' )
      .replace( /;$/m, '' );

    const parsedStringKeysWithRepoName = JSON.parse( unparsedStringKeysWithRepoName );
    stringKeysWithRepoName = parsedStringKeysWithRepoName.en;
    logger.info( 'got string keys with repo name from sim html; returning them' );
  }
  catch( e ) {
    logger.warn( 'an error occurred while trying to get string keys with repo name' );
    logger.error( e );
  }
  return stringKeysWithRepoName;
};

export default getStringKeysWithRepoName;