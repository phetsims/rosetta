// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a utility function that gets the URL for a sim or library's string file.
 *
 * @author Liam Mulhall
 */

import config from '../common/config.js';
import logger from '../common/logger.js';

/**
 * Return the URL of a repo's string file.
 *
 * @param {String} repoName - remote repository name; should be the same as a sim or library's name
 * @returns {String} - string file's URL
 */
const getStringFileUrl = repoName => {
  logger.verbose( `getting ${repoName}'s string file url` );
  logger.verbose( `got ${repoName}'s string file url; returning it` );
  return `${config.GITHUB_URL}/${repoName}/master/${repoName}-strings_en.json`;
};

export default getStringFileUrl;