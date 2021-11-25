// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import RosettaRoutes from './RosettaRoutes.js';

function Rosetta() {

  const [ websiteUserData, setWebsiteUserData ] = useState( {} );

  useEffect( async () => {
    try {
      const websiteUserDataRes = await axios.get( `${window.location.origin}/services/check-login` );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  let jsx;
  const allowedAccess = websiteUserData.loggedIn && ( websiteUserData.trustedTranslator || websiteUserData.teamMember );
  const notAllowedAccess = websiteUserData.loggedIn && ( !websiteUserData.trustedTranslator && !websiteUserData.teamMember );
  if ( allowedAccess ) {
    jsx = (
      <div>
        <h1>PhET Translation Tool</h1>
        <RosettaRoutes/>
      </div>
    );
  }
  else if ( notAllowedAccess ) {
    jsx = (
      <div>
        <h1>PhET Translation Tool</h1>
        <p>
          You need to be a trusted translator to access the PhET Translation Tool. To become a trusted translator,
          please send an email to phethelp@gmail.com.
        </p>
      </div>
    );
  }
  else if ( !websiteUserData.loggedIn ) {
    jsx = (
      <div>
        <h1>PhET Translation Tool</h1>
        <p>
          You need to sign in to access the PhET Translation Tool.
        </p>
        <a href={`${window.location.origin}/en/sign-in?dest=${window.location.href}`}>Sign In</a>
      </div>
    );
  }
  return jsx;
}

export default Rosetta;