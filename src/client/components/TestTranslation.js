// Copyright 2022, University of Colorado Boulder

/**
 * We define the test translation component.
 *
 * @author Liam Mulhall
 */

import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * This component is shown to the user when they press the test button when translating a sim.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const TestTranslation = () => {

  const location = useLocation();

  const iframeStyle = {
    height: '80vh',
    width: '100%'
  };

  return (
    <div>
      <iframe style={iframeStyle} srcDoc={location.state.html}></iframe>
    </div>
  );
};

export default TestTranslation;