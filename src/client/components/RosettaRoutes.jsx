// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall
 */

import React, { createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useLocaleInfo from '../hooks/useLocaleInfo.jsx';
import useSimNamesAndTitles from '../hooks/useSimNamesAndTitles.jsx';
import Admin from './Admin.jsx';
import Help from './Help.jsx';
import LocaleAndSimForm from './LocaleAndSimForm.jsx';
import Navbar from './Navbar.jsx';
import SignInInfo from './SignInInfo.jsx';
import TestTranslation from './TestTranslation.jsx';
import TranslationForm from './TranslationForm.jsx';
import TranslationReport from './TranslationReport.jsx';
import TranslationReportForm from './TranslationReportForm.jsx';

const LocaleInfoContext = createContext( {} );
const SimNamesAndTitlesContext = createContext( {} );

/**
 * This component defines routes and their respective components. If a user hits a certain route, the specified
 * component will be shown.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const RosettaRoutes = props => {
  const localeInfo = useLocaleInfo();
  const simNamesAndTitles = useSimNamesAndTitles();
  return (
    <BrowserRouter>
      <Navbar/>
      <div className='container'>
        {/* eslint-disable-next-line react/prop-types */}
        <SignInInfo websiteUserData={props.websiteUserData}/>
        <LocaleInfoContext.Provider value={localeInfo}>
          <SimNamesAndTitlesContext.Provider value={simNamesAndTitles}>
            <Routes>
              <Route path='/translate/test' element={<TestTranslation/>}/>
              <Route path='/translate' element={<LocaleAndSimForm/>}/>
              <Route path='/translate/report/:locale' element={<TranslationReport/>}/>
              <Route path='/translate/report' element={<TranslationReportForm/>}/>
              <Route path='/translate/help' element={<Help/>}/>
              <Route path='/translate/:locale/:simName' element={<TranslationForm/>}/>
              <Route path='/translate/admin' element={<Admin/>}/>
            </Routes>
          </SimNamesAndTitlesContext.Provider>
        </LocaleInfoContext.Provider>
      </div>
    </BrowserRouter>
  );
};

export default RosettaRoutes;
export { LocaleInfoContext, SimNamesAndTitlesContext };