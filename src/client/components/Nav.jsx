// Copyright 2022, University of Colorado Boulder

/**
 * Create a component for info and navigation links.
 *
 * @author <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import PhetHomePageLink from './PhetHomePageLink.jsx';
import { WebsiteUserDataContext } from './Rosetta.jsx';
import UserGuideLink from './UserGuideLink.jsx';

/**
 * Display user info, and several links.
 *
 * @returns {JSX.Element}
 */
const Nav = () => {
  const websiteUserData = useContext( WebsiteUserDataContext );
  const shouldSeeAdminLink = websiteUserData.loggedIn && websiteUserData.teamMember;
  return (
    <div className='card mt-4 mb-4'>
      <div className='card-body'>
        <ul className='nav nav-pills'>
          <li className='nav-item'>
            <Link className='nav-link' to='/translate'>Select Locale</Link>
          </li>
          <li className='nav-item'>
            <UserGuideLink/>
          </li>
          <li className='nav-item'>
            <PhetHomePageLink/>
          </li>
          {
            shouldSeeAdminLink ?
            <li>
              <Link className='nav-link' to='/translate/admin'>Admin</Link>
            </li> :
            <></>
          }
        </ul>
      </div>
    </div>
  );
};

export default Nav;