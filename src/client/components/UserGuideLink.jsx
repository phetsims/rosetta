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
    <a target='_blank' rel='noreferrer' className='nav-link' href='https://docs.google.com/document/d/e/2PACX-1vSZz9K1ris-dRNsLK9ZoG_KtMce1fJ1mlz-NDdk0KVB7Sfk_m18HmOaUKzb_zh6eFSsUwR1x6LCenLR/pub?embedded=true'>
      User Guide
    </a>
  );
};

export default UserGuideLink;