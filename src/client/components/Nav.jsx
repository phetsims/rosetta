// Copyright 2022, University of Colorado Boulder

/**
 * Create a component for info and navigation links.
 *
 * @author <liammulh@gmail.com>
 */

import { Link } from 'react-router-dom';
import PhetHomePageLink from './PhetHomePageLink.jsx';
import UserGuideLink from './UserGuideLink.jsx';

/**
 * Display user info, and several links.
 *
 * @returns {JSX.Element}
 */
const Nav = () => {
  return (
    <nav className='mt-4 mb-4'>
      <Link to='/translate'>Select Locale</Link> |&nbsp;
      <UserGuideLink/> |&nbsp;
      <PhetHomePageLink/>
    </nav>
  );
};

export default Nav;