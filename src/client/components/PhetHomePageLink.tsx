// Copyright 2022, University of Colorado Boulder

/**
 * Create a reusable PhET home page link.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { ReactElement } from 'react';

/**
 * Return the link to the PhET home page.
 */
const PhetHomePageLink = (): ReactElement => {
  return <a className='nav-link' href={window.location.origin}>PhET Home Page</a>;
};

export default PhetHomePageLink;