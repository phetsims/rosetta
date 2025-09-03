// Copyright 2023, University of Colorado Boulder

/**
 * Sign the user out.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import clientConfig from '../../common/clientConfig.js';
import alertErrorMessage from './alertErrorMessage.js';

/**
 * Send request to PhET server to sign the user out.
 */
const signOut = async (): Promise<void> => {
  try {
    const response = await fetch( clientConfig.SIGN_OUT_URL, {
      method: 'GET',
      credentials: 'include'
    } );

    // If the sign-out request was successful, redirect the user to the home page.
    if ( response.ok ) {
      window.location.href = window.location.origin;
    }
  }
  catch( e ) {
    await alertErrorMessage( String( e ) );
  }
};

export default signOut;