// Copyright 2022, University of Colorado Boulder

/**
 * We define the navigation bar.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import PhetLogo from '../img/phet-logo.png';
import { WebsiteUserDataContext } from './Rosetta.jsx';

/**
 * This component is the navigation bar you see at the top of the page once you've gained access to the translation
 * tool.
 *
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const websiteUserData = useContext( WebsiteUserDataContext );
  const shouldShowAdminLink = websiteUserData.loggedIn && websiteUserData.teamMember;
  const adminLinkJsx = (
    <li className='nav-item'>
      <Link className='nav-link' to='/translate/admin'>Admin</Link>
    </li>
  );
  return (
    <nav className='navbar navbar-expand-lg navbar-light bg-light'>
      <div className='container-fluid'>
        <a className='navbar-brand' href={window.origin}>
          <img src={PhetLogo} alt='PhET Logo' width='50' height='50'/>
        </a>
        <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarSupportedContent'>
          <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
            <li className='nav-item'>
              <Link className='nav-link' to='/translate'>Translate</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to='/translate/report'>Translation Report</Link>
            </li>
            <li className='nav-item'>
              <Link className='nav-link' to='/translate/help'>Help</Link>
            </li>
            {shouldShowAdminLink ? adminLinkJsx : <></>}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;