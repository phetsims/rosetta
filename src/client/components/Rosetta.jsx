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

import { createContext } from 'react';
import useWebsiteUserData from '../hooks/useWebsiteUserData.jsx';
import PhetHomePageLink from './PhetHomePageLink.jsx';
import RosettaRoutes from './RosettaRoutes.jsx';
import publicConfig from '../../common/publicConfig.js';

const WebsiteUserDataContext = createContext( {} );

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
 *
 * @returns {JSX.Element}
 */
function Rosetta() {
  const websiteUserData = useWebsiteUserData();
  let jsx = <p>Loading...</p>;
  const rosettaEnabled = Object.keys( publicConfig ).length > 0 && publicConfig.IS_ENABLED;
  if ( rosettaEnabled ) {
    const allowedAccess = websiteUserData.loggedIn && ( websiteUserData.trustedTranslator || websiteUserData.teamMember );
    const notAllowedAccess = websiteUserData.loggedIn && ( !websiteUserData.trustedTranslator && !websiteUserData.teamMember );
    if ( allowedAccess ) {
      jsx = (
        <WebsiteUserDataContext.Provider value={websiteUserData}>
          <RosettaRoutes/>
        </WebsiteUserDataContext.Provider>
      );
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
    else if ( !websiteUserData.loggedIn ) {
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
}

export { WebsiteUserDataContext };
export default Rosetta;