// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function that gets the URL for a sim or library's string file.
 *
 * @author Liam Mulhall
 */

import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

/**
 * Return the URL of a repo's string file.
 *
 * @param {String} repoName - remote repository name; should be the same as a sim or library's name
 * @param branchOrSha
 * @returns {String} - string file's URL
 */
const getStringFileUrl = ( repoName, branchOrSha = 'master' ) => {
  logger.verbose( `getting ${repoName}'s string file url` );
  logger.verbose( `got ${repoName}'s string file url; returning it` );
  return `${privateConfig.GITHUB_URL}/${repoName}/${branchOrSha}/${repoName}-strings_en.json`;
};

export default getStringFileUrl;