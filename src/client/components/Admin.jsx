// Copyright 2022, University of Colorado Boulder

/**
 * Create an admin page for viewing information on the running instance of Rosetta, and managing Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import TriggerBuild from './TriggerBuild.jsx';
import { WebsiteUserDataContext } from './Rosetta.jsx';
import Sha from './Sha.jsx';

/**
 * This component is an admin page for Rosetta. It contains information on the running instance of Rosetta, and has the
 * potential to allow users to manage Rosetta. It should only be visible to team members.
 *
 * @returns {JSX.Element}
 */
const Admin = () => {

  const websiteUserData = useContext( WebsiteUserDataContext );

  let jsx;
  const allowedAccess = websiteUserData.loggedIn && websiteUserData.teamMember;

  if ( allowedAccess ) {
    jsx = (
      <div>
        <h1>Admin</h1>
        <p>
          If you aren't a PhET Team Member, you shouldn't be seeing this page. Please send an email to
          phethelp@colorado.edu to help us resolve this.
        </p>
        <Sha/>
        <TriggerBuild/>
      </div>
    );
  }
  else {
    jsx = (
      <div>
        <h1>Nothing to see here! :)</h1>
        <p>Go back to the <Link to='/translate'>Translate</Link> page.</p>
      </div>
    );
  }
  return jsx;
};

export default Admin;