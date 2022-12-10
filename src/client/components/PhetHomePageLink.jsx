// Copyright 2022, University of Colorado Boulder

/**
 * Create a reusable PhET home page link.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

const PhetHomePageLink = () => {
  return <a href={window.location.origin}>PhET Home Page</a>;
};

export default PhetHomePageLink;