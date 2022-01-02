// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall
 */

import LocaleAndSimForm from './LocaleAndSimForm.js';
import React from 'react';
import TranslationForm from './TranslationForm.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/**
 * This component defines routes and their respective components. If a user hits a certain route, the specified
 * component will be shown.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const RosettaRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/translate' element={<LocaleAndSimForm/>}/>
        <Route path='/translate/:locale/:simName' element={<TranslationForm/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default RosettaRoutes;