// Copyright 2021, University of Colorado Boulder

/* eslint-disable indent */

import React, { useState } from 'react';
import LocaleSelect from './LocaleSelect.js';

const LocaleAndSimForm = () => {

  const [ localeSelected, setLocaleSelected ] = useState( false );
  const handleLocaleClick = () => {
    setLocaleSelected( true );
  };

  const table = (
    <div>
      <table>
        <thead>
        <tr>
          <th>Sim</th>
          <th>Strings Translated</th>
          <th>Total Strings</th>
          <th>Translate Button</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>acid base solutions</td>
          <td>24</td>
          <td>25</td>
          <td>
            <button>Translate</button>
          </td>
        </tr>
        <tr>
          <td>john travoltage</td>
          <td>16</td>
          <td>34</td>
          <td>
            <button>Translate</button>
          </td>
        </tr>
        <tr>
          <td>wave on a string</td>
          <td>42</td>
          <td>48</td>
          <td>
            <button>Translate</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <LocaleSelect/>
      <button onClick={handleLocaleClick}>Submit</button>
      {localeSelected ? table : null}
    </div>
  );
};

export default LocaleAndSimForm;