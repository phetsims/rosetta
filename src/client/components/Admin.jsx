// Copyright 2022, University of Colorado Boulder

import { Link } from 'react-router-dom';
import useWebsiteUserData from '../hooks/useWebsiteUserData.jsx';
import RebuildWithOriginalCredit from './RebuildWithOriginalCredit.jsx';
import Sha from './Sha.jsx';

const Admin = () => {

  const websiteUserData = useWebsiteUserData();

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
        <RebuildWithOriginalCredit/>
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