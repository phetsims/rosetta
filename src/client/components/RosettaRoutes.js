// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall
 */

import Footer from './Footer.js';
import LocaleAndSimForm from './LocaleAndSimForm.js';
import React from 'react';
import Navbar from './Navbar.js';
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
      <Navbar/>
      <div className='container'>
        <h1>PhET Translation Tool</h1>
        <Routes>
          <Route path='/translate' element={<LocaleAndSimForm/>}/>
          <Route path='/translate/:locale/:simName' element={<TranslationForm/>}/>
        </Routes>
      </div>
      <Footer/>
    </BrowserRouter>
  );
};

export default RosettaRoutes;