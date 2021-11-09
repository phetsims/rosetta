// Copyright 2021, University of Colorado Boulder

import React from 'react';
import ReactDOM from 'react-dom';
import Rosetta from './components/Rosetta.js';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <Rosetta/>
  </BrowserRouter>,
  document.getElementById( 'root' )
);