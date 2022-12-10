// Copyright 2022, University of Colorado Boulder

import Nav from './Nav.jsx';
import SignOutLink from './SignOutLink.jsx';
import UserInfo from './UserInfo.jsx';

/**
 * Create a header to be displayed on every page of the translation utility.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const RosettaHeader = () => {
  return (
    <>
      <h1>PhET Translation Utility (HTML5)</h1>
      <Nav/>
      <div className='mb-4'><UserInfo/> | <SignOutLink/></div>
    </>
  );
};

export default RosettaHeader;