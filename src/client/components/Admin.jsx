// Copyright 2022, University of Colorado Boulder

/* eslint-disable react/no-unescaped-entities */

import RebuildWithOriginalCredit from './RebuildWithOriginalCredit.jsx';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Admin = () => {

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