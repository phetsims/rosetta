// Copyright 2023, University of Colorado Boulder

/**
 * Returns the number of remaining requests to the GitHub API in the current hour. However, the "current hour" seems to
 * be a rolling window that the GitHub API calculates. This was created to address an issue where Rosetta was doing a
 * high number of GitHub requests and getting throttled as a result, see https://github.com/phetsims/rosetta/issues/410.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import config from '../../common/config.js';

/**
 * Fetches the number of remaining requests to the GitHub API in the current hour.
 *
 * @returns A promise resolving to the number of remaining requests.
 */
const getRemainingGHRequests = async (): Promise<number> => {
  const response = await fetch( 'https://api.github.com/users/phet-dev', {
    method: 'GET',
    headers: new Headers( {
      Authorization: `Bearer ${config.GITHUB_PAT}`,
      'X-GitHub-Api-Version': '2022-11-28'
    } )
  } );

  if ( !response.ok ) {
    throw new Error( `Failed to fetch remaining requests: ${response.status} ${response.statusText}` );
  }

  const remainingRequests = response.headers.get( 'x-ratelimit-remaining' );
  return remainingRequests ? Number( remainingRequests ) : 0;
};

export default getRemainingGHRequests;