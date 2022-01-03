// Copyright 2022, University of Colorado Boulder

/**
 * We define the navigation bar.
 *
 * @author Liam Mulhall
 */

import PhetLogo from '../img/phet-logo.png';
import React from 'react';

/**
 * This component is the navigation bar you see at the top of the page once you've gained access to the translation
 * tool.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const Navbar = () => {
  return (
    <nav className='navbar navbar-expand-lg navbar-light bg-light'>
      <div className='container-fluid'>
        <a className='navbar-brand' href='#'>
          <img src={PhetLogo} alt='PhET Logo' width='50' height='50'/>
        </a>
        <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarSupportedContent'>
          <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
            <li className='nav-item'>
              <a className='nav-link' href='#'>Select Locale and Sim</a>
            </li>
            <li className='nav-item'>
              <a className='nav-link' href='#'>Translation Statistics</a>
            </li>
            <li className='nav-item'>
              <a className='nav-link' href='#'>Help</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;