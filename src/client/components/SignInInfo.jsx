// Copyright 2022, University of Colorado Boulder

import { useContext } from 'react';
import { WebsiteUserDataContext } from './Rosetta.jsx';
import SignOutLink from './SignOutLink.jsx';
import personCircle from '../img/person-circle.svg';

const SignInInfo = () => {
  const websiteUserData = useContext( WebsiteUserDataContext );
  return (
    <p className='mt-4'>
      <img src={personCircle} alt='person icon' width='20px'/>&nbsp;
      {websiteUserData.email} | <SignOutLink/>
    </p>
  );
};

export default SignInInfo;