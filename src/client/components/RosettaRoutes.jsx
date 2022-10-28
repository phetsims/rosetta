// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall
 */

import React, { createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useLocaleInfo from '../hooks/useLocaleInfo.jsx';
import useSimNames from '../hooks/useSimNames.jsx';
import useSimTitles from '../hooks/useSimTitles.jsx';
import Admin from './Admin.jsx';
import Help from './Help.jsx';
import LocaleAndSimForm from './LocaleAndSimForm.jsx';
import Navbar from './Navbar.jsx';
import TestTranslation from './TestTranslation.jsx';
import TranslationForm from './TranslationForm.jsx';
import TranslationReport from './TranslationReport.jsx';
import TranslationReportForm from './TranslationReportForm.jsx';

const LocaleInfoContext = createContext( {} );
const SimNamesContext = createContext( [] );
const SimTitlesContext = createContext( [] );

/**
 * This component defines routes and their respective components. If a user hits a certain route, the specified
 * component will be shown.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const RosettaRoutes = () => {
  const localeInfo = useLocaleInfo();
  const simNames = useSimNames();
  const simTitles = useSimTitles();
  return (
    <BrowserRouter>
      <Navbar/>
      <div className='container'>
        {/* TODO: Consolidate these context providers. See <issue-link>.*/}
        <LocaleInfoContext.Provider value={localeInfo}>
          <SimNamesContext.Provider value={simNames}>
            <SimTitlesContext.Provider value={simTitles}>
              <Routes>
                <Route path='/translate/test' element={<TestTranslation/>}/>
                <Route path='/translate' element={<LocaleAndSimForm/>}/>
                <Route path='/translate/report/:locale' element={<TranslationReport/>}/>
                <Route path='/translate/report' element={<TranslationReportForm/>}/>
                <Route path='/translate/help' element={<Help/>}/>
                <Route path='/translate/:locale/:simName' element={<TranslationForm/>}/>
                <Route path='/translate/admin' element={<Admin/>}/>
              </Routes>
            </SimTitlesContext.Provider>
          </SimNamesContext.Provider>
        </LocaleInfoContext.Provider>
      </div>
    </BrowserRouter>
  );
};

export default RosettaRoutes;
export { LocaleInfoContext, SimNamesContext, SimTitlesContext };