// Copyright 2022, University of Colorado Boulder

/**
 * Show user info.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { useContext } from 'react';
import personCircle from '../img/person-circle.svg';
import { LoginStateContext } from './Rosetta.jsx';

/**
 * Display user's sign-in info obtained from website user data.
 */
const UserInfo: React.FC = () => {
  const loginState = useContext( LoginStateContext );
  return (
    <>
      <img src={personCircle} alt='person icon' width='20px'/>&nbsp;
      Signed in as: {loginState.email}
    </>
  );
};

export default UserInfo;