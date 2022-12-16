// Copyright 2022, University of Colorado Boulder

/**
 * Show user info.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import personCircle from '../img/person-circle.svg';
import { WebsiteUserDataContext } from './Rosetta.jsx';

/**
 * Display user's sign-in info obtained from website user data.
 *
 * @returns {JSX.Element}
 */
const UserInfo = () => {
  const websiteUserData = useContext( WebsiteUserDataContext );
  return (
    <>
      <img src={personCircle} alt='person icon' width='20px'/>&nbsp;
      Signed in as: {websiteUserData.email}
    </>
  );
};

export default UserInfo;