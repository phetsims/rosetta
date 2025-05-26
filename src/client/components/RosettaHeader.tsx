// Copyright 2022, University of Colorado Boulder

/**
 * Create a header to be displayed on every page of the translation utility.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';
import Nav from './Nav';
import SignOutLink from './SignOutLink';
import UserInfo from './UserInfo';

/**
 * Return a "header" (i.e. info) to be shown at the top of every page on the translation
 * utility.
 */
const RosettaHeader: React.FC = () => {
  return (
    <>
      <h1>PhET Translation Utility (HTML5)</h1>
      <Nav/>
      <div className='mb-4'><UserInfo/> | <SignOutLink/></div>
    </>
  );
};

export default RosettaHeader;