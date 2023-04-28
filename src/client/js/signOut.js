// Copyright 2023, University of Colorado Boulder

/**
 * Sign the user out.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import publicConfig from '../../common/publicConfig.js';
import alertErrorMessage from './alertErrorMessage.js';

/**
 * Send request to PhET server to sign the user out.
 *
 * @returns {Promise<void>}
 */
const signOut = async () => {
  try {
    const signOutRes = await axios( {
      url: publicConfig.SIGN_OUT_URL,
      method: 'get',
      withCredentials: true
    } );

    // If the sign-out request was successful, redirect the user to the home page.
    if ( signOutRes.status >= 200 && signOutRes.status < 300 ) {
      window.location.href = window.location.origin;
    }
  }
  catch( e ) {
    alertErrorMessage( e );
  }
};

export default signOut;