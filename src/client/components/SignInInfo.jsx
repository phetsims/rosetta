// Copyright 2022, University of Colorado Boulder

import { useContext } from 'react';
import { WebsiteUserDataContext } from './Rosetta.jsx';

const SignInInfo = () => {

  const websiteUserData = useContext( WebsiteUserDataContext );

  return (
    <div>
      <p>Signed in as: {websiteUserData.email}</p>
    </div>
  );
};

export default SignInInfo;