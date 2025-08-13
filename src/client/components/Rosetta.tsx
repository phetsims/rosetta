// Copyright 2021, University of Colorado Boulder

/**
 * We ensure only trusted translators and team members can access the translation tool. If a user is signed in, but
 * neither a trusted translator nor a team member, they are prompted to request access to the translation tool. If a
 * user is not signed in, they are prompted to sign in.
 *
 * Assuming the user is either a trusted translator or a team member, they see the translation tool. We do this by
 * returning the routes component.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { createContext, ReactElement } from 'react';
import clientConfig from '../../common/clientConfig';
import { LoginState } from '../../common/LoginState.js';
import useLoginState from '../hooks/useLoginState';
import PhetHomePageLink from './PhetHomePageLink';
import RosettaRoutes from './RosettaRoutes';

const LoginStateContext = createContext<LoginState>( { loggedIn: false } );

/**
 * If a user is allowed access to the translation tool, this component will contain some header stuff and the routes
 * component.
 *
 * If a user is not allowed access to the translation tool, this component will contain some header stuff and info on
 * how to request access to the translation tool.
 *
 * If a user is not signed in, this component will contain some header stuff and a link to sign in that will redirect
 * them to the translation utility.
 *
 * If Rosetta isn't enabled, a message about Rosetta being down for maintenance will be shown.
 */
const Rosetta: React.FC = (): ReactElement => {
  const loginState = useLoginState();
  let jsx: ReactElement = <p>Loading...</p>;
  const rosettaEnabled = Object.keys( clientConfig ).length > 0 && clientConfig.IS_ENABLED;

  if ( rosettaEnabled ) {
    const allowedAccess = loginState.loggedIn && ( loginState.isTrustedTranslator || loginState.isTeamMember );
    const notAllowedAccess = loginState.loggedIn && ( !loginState.isTrustedTranslator && !loginState.isTeamMember );

    if ( allowedAccess ) {
      jsx = (
        <LoginStateContext.Provider value={loginState}>
          <RosettaRoutes/>
        </LoginStateContext.Provider>
      );

      // Save the user ID in session storage.  This is part of a workaround for an issue where null user IDs where being
      // committed when sessions expired, see https://github.com/phetsims/rosetta/issues/412.
      // TODO: Remove this when better login checking exists, see https://github.com/phetsims/rosetta/issues/413.
      window.sessionStorage.setItem( 'phetUserId', loginState.phetUserId!.toString() );
    }
    else if ( notAllowedAccess ) {
      jsx = (
        <div className='container m-5'>
          <h1>PhET Translation Utility (HTML5)</h1>
          <p>
            You need to be a trusted translator to access the PhET Translation Utility. To become a trusted translator,
            please send an email to phethelp@gmail.com.
          </p>
        </div>
      );
    }
    else if ( !loginState.loggedIn ) {
      jsx = (
        <div className='container m-5'>
          <h1>PhET Translation Utility (HTML5)</h1>
          <p>
            You need to sign in to access the PhET Translation Utility.
          </p>
          <a href={`${window.location.origin}/en/sign-in?dest=${encodeURIComponent( window.location.href )}`}>Sign In</a>
        </div>
      );
    }
  }
  else {
    jsx = (
      <div className='container m-5'>
        <h1>PhET Translation Utility (HTML5)</h1>
        <p>
          The translation utility is down for maintenance.
        </p>
        <PhetHomePageLink/>
      </div>
    );
  }

  return jsx;
};

export { LoginStateContext };
export default Rosetta;