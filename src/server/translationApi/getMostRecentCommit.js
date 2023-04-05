// Copyright 2023, University of Colorado Boulder

/**
 * Export a function that gets the most recent commit for a given repo and branch.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Octokit } from 'octokit';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

const octokit = new Octokit( { auth: privateConfig.GITHUB_PAT } );

/**
 * Get the most recent commit for a given repo and branch.
 *
 * @param {String} repo - the repo name
 * @param {String} branch - the branch name
 * @returns {Promise<string>} - the most recent commit
 */
const getMostRecentCommit = async ( repo, branch ) => {
  let mostRecentCommit = '';
  try {
    const response = await octokit.request( `GET /repos/phetsims/${repo}/commits/${branch}` );
    if ( response.status >= 200 && response.status < 300 ) {
      mostRecentCommit = response.data.sha;
    }
  }
  catch( e ) {
    logger.error( e );
  }
  return mostRecentCommit;
};

export default getMostRecentCommit;