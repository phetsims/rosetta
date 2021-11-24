// Copyright 2021, University of Colorado Boulder

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LocaleAndSimForm from './LocaleAndSimForm.js';
import TranslationForm from './TranslationForm.js';

const RosettaRoutes = () => {
  return (
    <Routes>
      <Route path='/translate' element={<LocaleAndSimForm/>}>
        <Route path=':locale/:sim' element={<TranslationForm/>}/>
      </Route>
    </Routes>
  );
};

export default RosettaRoutes;