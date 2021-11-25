// Copyright 2021, University of Colorado Boulder

/* eslint-disable indent */
/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react';
import TranslationRow from './TranslationRow.js';

const TranslationTable = props => {

  const [ simSpecificRows, setSimSpecificRows ] = useState( [] );
  const [ commonRows, setCommonRows ] = useState( [] );
  useEffect( () => {
    for ( const stringKeyWithoutDots in props.translationFormData.simSpecific ) {
      const englishString = props.translationFormData.simSpecific[ stringKeyWithoutDots ].english;
      const stringKeyWithDots = stringKeyWithoutDots.split( '_DOT_' ).join( '.' );
      setSimSpecificRows( simSpecificRows => [ ...simSpecificRows,
        <TranslationRow
          key={stringKeyWithDots}
          name={`simSpecific.${stringKeyWithoutDots}.translated`}
          stringKey={stringKeyWithDots}
          englishString={englishString}
        />
      ] );
    }
    for ( const stringKeyWithoutDots in props.translationFormData.common ) {
      const englishString = props.translationFormData.common[ stringKeyWithoutDots ].english;
      const stringKeyWithDots = stringKeyWithoutDots.split( '_DOT_' ).join( '.' );
      setCommonRows( commonRows => [ ...commonRows,
        <TranslationRow
          key={stringKeyWithDots}
          name={`common.${stringKeyWithoutDots}.translated`}
          stringKey={stringKeyWithDots}
          englishString={englishString}
        />
      ] );
    }
  }, [ props.translationFormData ] );

  return (
    <div>
      <h2>Sim-Specific Strings</h2>
      <h3>(Translating these strings will only affect the selected simulation.)</h3>
      <table>
        <thead>
        <tr>
          <th>String Key</th>
          <th>English String</th>
          <th>Translation</th>
        </tr>
        </thead>
        <tbody>
        {simSpecificRows}
        </tbody>
      </table>
      <h2>Common Strings</h2>
      <h3>(Translating these strings will affect multiple simulations.)</h3>
      <table>
        <thead>
        <tr>
          <th>String Key</th>
          <th>English String</th>
          <th>Translation</th>
        </tr>
        </thead>
        <tbody>
        {commonRows}
        </tbody>
      </table>
    </div>
  );
};

export default TranslationTable;