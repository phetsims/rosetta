// Copyright 2021, University of Colorado Boulder

import logger from './logger.js';
import config from './config.js';

const getStringKeysWithRepoName = simHtml => {

  simHtml = simHtml.data;

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

  logger.info( 'returning string keys with repo name' );
  return Object.keys( parsedStringKeysWithRepoName.en );
};

export { getStringKeysWithRepoName as default };