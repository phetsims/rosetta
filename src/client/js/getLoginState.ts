// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that gets the PhET website user data object.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import clientConfig from '../../common/clientConfig.js';
import { LoginState } from '../../common/LoginState.js';

/**
 * Get the user data object from website.
 */
const getLoginState = async (): Promise<LoginState> => {
  const response = await fetch( clientConfig.WEBSITE_USER_DATA_URL, {
      method: 'GET',
      credentials: 'include' // Include cookies so website backend can look up the session.
    }
  );

  if ( !response.ok ) {
    throw new Error( `Failed to fetch user data: ${response.status} ${response.statusText}` );
  }

  const loginState: LoginState = await response.json();

  // Make sure the user ID is a number if it is present. We do this because on some servers it's a string and on others
  // it's a number, see https://github.com/phetsims/rosetta/issues/373.
  if ( typeof loginState.phetUserId === 'string' && !isNaN( Number( loginState.phetUserId ) ) ) {
    loginState.phetUserId = Number( loginState.phetUserId );
  }
  return loginState;
};

export default getLoginState;