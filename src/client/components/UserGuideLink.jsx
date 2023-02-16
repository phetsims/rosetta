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
    <a target='_blank' rel='noreferrer' className='nav-link' href='https://docs.google.com/document/d/1MS5jrwM_NOD8v0Byr0drgAFB3aBb1_4ixFdMjBNc-C8/edit?usp=sharing'>
      User Guide
    </a>
  );
};

export default UserGuideLink;