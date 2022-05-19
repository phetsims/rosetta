// Copyright 2022, University of Colorado Boulder

/**
 * We define the footer.
 *
 * @author Liam Mulhall
 */

import React from 'react';

/**
 * This component is the footer you see at the bottom of the page once you've gained access to the translation tool.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const Footer = () => {
  const footerStyle = {
    backgroundColor: 'rgb(200, 200, 200)',
    bottom: '0',
    marginTop: '1rem',
    padding: '2rem',
    textAlign: 'center',
    width: '100%'
  };

  // for dynamic footer date
  // eslint-disable-next-line new-cap
  const currentYear = new Date().getFullYear();

  return (
    <footer className='text-muted' style={footerStyle}>
      <div>
        If you notice an issue, please send an email to phethelp@colorado.edu.
      </div>
      <div>
        Copyright &copy; 2021-{currentYear}, University of Colorado Boulder
      </div>
    </footer>
  );
};

export default Footer;