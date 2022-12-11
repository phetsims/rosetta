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

import useConfig from '../hooks/useConfig.jsx';
import { createContext } from 'react';
import useWebsiteUserData from '../hooks/useWebsiteUserData.jsx';
import PhetHomePageLink from './PhetHomePageLink.jsx';
import RosettaRoutes from './RosettaRoutes.jsx';

const WebsiteUserDataContext = createContext( {} );
const ConfigContext = createContext( {} );

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
 */
function Rosetta() {
  const config = useConfig();
  let jsx;
  if ( Object.keys( config ).length > 0 && config.common.IS_ENABLED ) {

    const websiteUserData = useWebsiteUserData();

    const allowedAccess = websiteUserData.loggedIn && ( websiteUserData.trustedTranslator || websiteUserData.teamMember );
    const notAllowedAccess = websiteUserData.loggedIn && ( !websiteUserData.trustedTranslator && !websiteUserData.teamMember );
    if ( allowedAccess ) {
      jsx = (
        <ConfigContext.Provider value={config}>
          <WebsiteUserDataContext.Provider value={websiteUserData}>
            <RosettaRoutes/>
          </WebsiteUserDataContext.Provider>
        </ConfigContext.Provider>
      );
    }
    else if ( notAllowedAccess ) {
      jsx = (
        <div className='container m-5'>
          <h1>PhET Translation Utility (HTML5)</h1>
          <p>
            You need to be a trusted translator to access the PhET Translation Tool. To become a trusted translator,
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
            You need to sign in to access the PhET Translation Tool.
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

export { ConfigContext, WebsiteUserDataContext };
export default Rosetta;