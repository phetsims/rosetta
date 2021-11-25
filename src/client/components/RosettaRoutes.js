// Copyright 2021, University of Colorado Boulder

import LocaleAndSimForm from './LocaleAndSimForm.js';
import React from 'react';
import TranslationForm from './TranslationForm.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const RosettaRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/translate' element={<LocaleAndSimForm/>}>
          <Route path=':locale/:sim' element={<TranslationForm/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default RosettaRoutes;