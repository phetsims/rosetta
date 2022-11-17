// Copyright 2022, University of Colorado Boulder

/**
 * Create a page that provides help on using Rosetta. It is meant to be used by translators.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';

/**
 * This component displays the help guide in an iframe. It also provides a link to the help guide. The help guide is a
 * Google Doc that has been published to the web.
 *
 * @returns {JSX.Element}
 */
const Help = () => {

  const iframeStyle = {
    height: '40rem',
    width: '40rem'
  };

  return (
    <div>
      <h1>Help</h1>
      <div>
        <iframe
          className='border border-dark rounded'
          src='https://docs.google.com/document/d/e/2PACX-1vTvlrfE9jTezskMwp-3QP6c3pzDBcbM1qH4FY6mKTAMwyZJDEC_oYc-fSW6HWgc4lgq7NTs4yCpXb6x/pub?embedded=true'
          style={iframeStyle}
        >
        </iframe>
      </div>
      <div>
        <a href='https://docs.google.com/document/d/e/2PACX-1vTvlrfE9jTezskMwp-3QP6c3pzDBcbM1qH4FY6mKTAMwyZJDEC_oYc-fSW6HWgc4lgq7NTs4yCpXb6x/pub'>
          View in Google Docs
        </a>
      </div>
    </div>
  );
};

export default Help;