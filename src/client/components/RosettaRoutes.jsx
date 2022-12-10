// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useLocaleInfo from '../hooks/useLocaleInfo.jsx';
import useSimNamesAndTitles from '../hooks/useSimNamesAndTitles.jsx';
import Admin from './Admin.jsx';
import RosettaHeader from './RosettaHeader.jsx';
import TranslationForm from './TranslationForm.jsx';
import TranslationReport from './TranslationReport.jsx';
import TranslationReportForm from './TranslationReportForm.jsx';

const LocaleInfoContext = createContext( {} );
const SimNamesAndTitlesContext = createContext( {} );

/**
 * This component defines routes and their respective components. If a user hits a certain route, the specified
 * component will be shown.
 *
 * We also set up a fair number of "contexts" in this module. A context is a way of providing data without having to
 * pass it as props.
 *
 * @returns {JSX.Element}
 */
const RosettaRoutes = () => {
  const localeInfo = useLocaleInfo();
  const simNamesAndTitles = useSimNamesAndTitles();
  return (
    <BrowserRouter>
      <div className='container m-5'>
        <RosettaHeader/>
        <LocaleInfoContext.Provider value={localeInfo}>
          <SimNamesAndTitlesContext.Provider value={simNamesAndTitles}>
            <Routes>
              <Route path='/translate' element={<TranslationReportForm/>}/>
              <Route path='/translate/:locale' element={<TranslationReport/>}/>
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