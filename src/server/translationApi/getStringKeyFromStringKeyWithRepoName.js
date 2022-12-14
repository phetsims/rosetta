// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function that extracts a camelCase string key from a string that looks like REPO_NAME/stringKey.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from './logger.js';

/**
 * Return a camelCase string key from a string that looks like stringKey/REPO_NAME. We get the strings that look like
 * REPO_NAME/stringKey from a sim's HTML.
 *
 * @param {String} stringKeyWithRepoName - stringKey/REPO_NAME we get from a sim's HTML
 * @returns {String} - camelCase string key
 */
const getStringKeyFromStringKeyWithRepoName = stringKeyWithRepoName => {
  logger.verbose( `getting string key from ${stringKeyWithRepoName}` );
  logger.verbose( `got string key from ${stringKeyWithRepoName}; returning it` );
  return stringKeyWithRepoName.match( /\/(.*)/ )[ 0 ].replace( '/', '' );
};

export default getStringKeyFromStringKeyWithRepoName;