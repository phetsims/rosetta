// Copyright 2022, University of Colorado Boulder

/**
 * Create a reusable user guide link.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/**
 * Return a link to the user guide.
 *
 * @returns {JSX.Element}
 */
const UserGuideLink = () => {
  return (
    <a target='_blank' rel='noreferrer' className='nav-link' href='https://docs.google.com/document/d/e/2PACX-1vSYc8f01StQ7e2nQWBA38BZfLoqkm6rkn-F9BzTmxdNgazOzFfLDm5RI-3I3IdKccuBFQpFdT2ST5Px/pub'>
      User Guide
    </a>
  );
};

export default UserGuideLink;