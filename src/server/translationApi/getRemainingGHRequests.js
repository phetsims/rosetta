// Copyright 2023, University of Colorado Boulder

/**
 * Returns the number of remaining requests to the GitHub API in the current hour.
 * However, the "current hour" seems to be a rolling window that the GitHub API
 * calculates. This was created to address the issue described in
 * https://github.com/phetsims/rosetta/issues/410.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import privateConfig from '../../common/privateConfig.js';

const getRemainingGHRequests = async () => {
  const res = await axios( {
    method: 'get',
    url: 'https://api.github.com/users/phet-dev',
    headers: {
      Authorization: `Bearer ${privateConfig.GITHUB_PAT}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  } );
  return Number( res.headers[ 'x-ratelimit-remaining' ] );
};

export default getRemainingGHRequests;