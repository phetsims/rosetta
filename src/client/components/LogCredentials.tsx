// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that consists of some explanatory information and a button that logs the current user data
 * information to the console.  This is used for debugging credential problems, and was created originally to help
 * debug https://github.com/phetsims/rosetta/issues/412.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import '../styles/input-error.css';
import React, { ReactElement } from 'react';
import getWebsiteUserData from '../js/getWebsiteUserData';

const logUserCredentials = async (): Promise<void> => {
  const websiteUserData = await getWebsiteUserData();
  console.log( `websiteUserData = ${JSON.stringify( websiteUserData, null, 2 )}` );
  console.log( `userId from session storage: ${window.sessionStorage.getItem( 'userId' )}` );
};

const LogCredentials = (): ReactElement => {
  const blueButton = 'btn btn-primary mt-2';
  return (
    <div className='mt-4'>
      <h2>Log Credentials</h2>
      <p>
        Log the current users credential information to the dev tools console.
      </p>
      <button
        className={blueButton}
        onClick={logUserCredentials}
      >
        Log Credentials
      </button>
    </div>
  );
};

export default LogCredentials;