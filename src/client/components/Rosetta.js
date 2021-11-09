// Copyright 2021, University of Colorado Boulder

import LocaleAndSimForm from './LocaleAndSimForm.js';
import React from 'react';
import TranslationForm from './TranslationForm.js';
import { Routes, Route } from 'react-router-dom';

function Rosetta() {
  return (
    <div>
      <h1>PhET Translation Tool</h1>
      <Routes>
        <Route path='/translate' element={<LocaleAndSimForm/>}>
          <Route path=':locale/:sim' element={<TranslationForm/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default Rosetta;