// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall
 */

import TestTranslation from './TestTranslation.js';
import Footer from './Footer.js';
import Help from './Help.js';
import LocaleAndSimForm from './LocaleAndSimForm.js';
import Navbar from './Navbar.js';
import React from 'react';
import TranslationForm from './TranslationForm.js';
import TranslationReport from './TranslationReport.js';
import TranslationReportForm from './TranslationReportForm.js';
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
        <Routes>
          <Route path='/translate/test' element={<TestTranslation/>}/>
          <Route path='/translate' element={<LocaleAndSimForm/>}/>
          <Route path='/translate/report/:locale' element={<TranslationReport/>}/>
          <Route path='/translate/report' element={<TranslationReportForm/>}/>
          <Route path='/translate/help' element={<Help/>}/>
          <Route path='/translate/:locale/:simName' element={<TranslationForm/>}/>
        </Routes>
      </div>
      <Footer/>
    </BrowserRouter>
  );
};

export default RosettaRoutes;