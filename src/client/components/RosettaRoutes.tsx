// Copyright 2021, University of Colorado Boulder

/**
 * We use React Router to set up routes for the translation tool.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { createContext, ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LocaleInfo, SimNamesAndTitles } from '../ClientDataTypes';
import useLocaleInfo from '../hooks/useLocaleInfo';
import useSimNamesAndTitles from '../hooks/useSimNamesAndTitles';
import Admin from './Admin';
import RosettaHeader from './RosettaHeader';
import TranslationForm from './TranslationForm';
import TranslationReport from './TranslationReport';
import TranslationReportForm from './TranslationReportForm';

const LocaleInfoContext = createContext<LocaleInfo>( {} as LocaleInfo );
const SimNamesAndTitlesContext = createContext<SimNamesAndTitles>( {} as SimNamesAndTitles );

/**
 * This component defines routes and their respective components. If a user hits a certain route, the specified
 * component will be shown.
 *
 * We also set up a fair number of 'contexts' in this module. A context is a way of providing data without having to
 * pass it as props.
 */
const RosettaRoutes: React.FC = (): ReactElement => {
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