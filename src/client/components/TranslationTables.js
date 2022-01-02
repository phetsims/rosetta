// Copyright 2021, University of Colorado Boulder

/* eslint-disable indent */
/* eslint-disable react/prop-types */

/**
 * We define the sim-specific translation table and the common translation table that will go in the translation form.
 *
 * @author Liam Mulhall
 */

import React, { useEffect, useState } from 'react';
import TranslationRow from './TranslationRow.js';

/**
 * This component has some headers, some info, and a table for sim-specific strings and common strings. The header
 * tells the user whether the table is for sim-specific strings or common strings; the info tells the user what will
 * happen if they translate the strings; and the table has rows of string key, English string, and input.
 *
 * @param {Object} props - props passed to this component
 * @returns {JSX.Element}
 * @constructor
 */
const TranslationTables = props => {

  // for storing and setting sim-specific and common rows
  const [ simSpecificRows, setSimSpecificRows ] = useState( [] );
  const [ commonRows, setCommonRows ] = useState( [] );

  // populate sim-specific and common rows
  useEffect( () => {

    // create list of sim-specific rows to iterate over
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

    // create list of common rows to iterate over
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

        {/* iterate over the sim-specific rows */}
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

        {/* iterate over the common rows */}
        {commonRows}
        </tbody>
      </table>
    </div>
  );
};

export default TranslationTables;