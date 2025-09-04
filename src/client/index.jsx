// Copyright 2022, University of Colorado Boulder

/**
 * We use React to render the main translation tool component.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Rosetta from './components/Rosetta.jsx';

ReactDOM.render(
  <Rosetta/>,
  document.getElementById( 'root' )
);