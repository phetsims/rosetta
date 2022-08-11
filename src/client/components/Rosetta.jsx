// Copyright 2021, University of Colorado Boulder

/**
 * We ensure only trusted translators and team members can access the translation tool. If a user is signed in, but
 * neither a trusted translator nor a team member, they are prompted to request access to the translation tool. If a
 * user is not signed in, they are prompted to sign in.
 *
 * Assuming the user is either a trusted translator or a team member, they see the translation tool. We do this by
 * returning the routes component.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import RosettaRoutes from './RosettaRoutes.jsx';

/**
 * If a user is allowed access to the translation tool, this component will contain some header stuff and the routes
 * component.
 *
 * If a user is not allowed access to the translation tool, this component will contain some header stuff and info on
 * how to request access to the translation tool.
 *
 * If a user is not signed in, this component will contain some header stuff and a link to sign in that will redirect
 * them to this page.
 *
 * @returns {JSX.Element}
 * @constructor
 */
function Rosetta() {

  // for storing and setting website user data
  const [ websiteUserData, setWebsiteUserData ] = useState( {} );

  // get website user data
  useEffect( async () => {
    try {
      const websiteUserDataRes = await axios.get( `${window.location.origin}/services/check-login` );
      setWebsiteUserData( websiteUserDataRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  // logic for ensuring only trusted translators or team members have access to the translation tool
  let jsx;
  const allowedAccess = websiteUserData.loggedIn && ( websiteUserData.trustedTranslator || websiteUserData.teamMember );
  const notAllowedAccess = websiteUserData.loggedIn && ( !websiteUserData.trustedTranslator && !websiteUserData.teamMember );
  if ( allowedAccess ) {
    jsx = (
      <RosettaRoutes/>
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