// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function that extracts a lowercase-kebab (repo-style) repo name (e.g. acid-base-solutions) from
 * a string that looks like REPO_NAME/stringKey.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from './logger.js';

/**
 * Return a lowercase-kebab (repo-style) repo name (e.g. acid-base-solutions) from a string that looks like
 * stringKey/REPO_NAME. We get the strings that look like REPO_NAME/stringKey from a sim's HTML.
 *
 * @param stringKeyWithRepoName - stringKey/REPO_NAME we get from a sim's HTML
 * @returns lowercase-kebab (repo-style) repo name (e.g. acid-base-solutions)
 */
const getRepoNameFromStringKeyWithRepoName = ( stringKeyWithRepoName: string ): string => {
  logger.verbose( `getting lowercase-kebab repo name from ${stringKeyWithRepoName}` );
  const repoNameRegEx = /.*(?=\/)/;
  const repoName = stringKeyWithRepoName.match( repoNameRegEx );

  if ( !repoName || repoName.length === 0 ) {
    throw new Error( `Invalid stringKeyWithRepoName format: ${stringKeyWithRepoName}` );
  }

  const lowercaseKebabRepoName = repoName[ 0 ].toLowerCase().replaceAll( '_', '-' );
  logger.verbose( `got lowercase-kebab repo name from ${stringKeyWithRepoName}; returning it` );
  return lowercaseKebabRepoName;
};

export default getRepoNameFromStringKeyWithRepoName;