// Copyright 2021, University of Colorado Boulder

/**
 * We use React to render the main translation tool component.
 *
 * @author Liam Mulhall
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Rosetta from './components/Rosetta.js';

ReactDOM.render(
  <Rosetta/>,
  document.getElementById( 'root' )
);