// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall
 */

import Admin from './Admin.jsx';
import TestTranslation from './TestTranslation.jsx';
import Help from './Help.jsx';
import LocaleAndSimForm from './LocaleAndSimForm.jsx';
import Navbar from './Navbar.jsx';
import React from 'react';
import TranslationForm from './TranslationForm.jsx';
import TranslationReport from './TranslationReport.jsx';
import TranslationReportForm from './TranslationReportForm.jsx';
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
          <Route path='/translate/admin' element={<Admin/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default RosettaRoutes;