// Copyright 2022, University of Colorado Boulder

/**
 * We use React to render the main translation tool component.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React from 'react';
import ReactDOM from 'react-dom';

// Since index.jsx is not compiled, we need to import the .tsx file directly.
// eslint-disable-next-line phet/import-statement-extension-js
import Rosetta from './components/Rosetta.tsx';

ReactDOM.render(
  <Rosetta/>,
  document.getElementById( 'root' )
);