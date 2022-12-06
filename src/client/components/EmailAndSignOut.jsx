// Copyright 2022, University of Colorado Boulder

/**
 * Create a component that displays a user's email and a link to sign out.
 *
 * @author <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { WebsiteUserDataContext } from './Rosetta.jsx';
import SignOutLink from './SignOutLink.jsx';
import personCircle from '../img/person-circle.svg';

/**
 * Display the user's email and a link to sign out.
 *
 * @returns {JSX.Element}
 */
const EmailAndSignOut = () => {
  const websiteUserData = useContext( WebsiteUserDataContext );
  return (
    <p className='mt-4'>
      <img src={personCircle} alt='person icon' width='20px'/>&nbsp;
      {websiteUserData.email} | <SignOutLink/>
    </p>
  );
};

export default EmailAndSignOut;