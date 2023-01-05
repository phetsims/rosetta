// Copyright 2021, University of Colorado Boulder

/* eslint-disable indent */

/**
 * We define the sim-specific translation table and the common translation table that will go in the translation form.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import React, { useEffect, useState } from 'react';
import TranslationFormRow from './TranslationFormRow.jsx';
import KeyTypesEnum from '../../common/KeyTypesEnum.js';

/**
 * This component has some headers, some info, and a table for sim-specific strings and common strings. The header
 * tells the user whether the table is for sim-specific strings or common strings; the info tells the user what will
 * happen if they translate the strings; and the table has rows of string key, English string, and input.
 *
 * @param {Object} props - props passed to this component
 * @returns {JSX.Element}
 */
const TranslationFormTables = props => {

  const [ simSpecificRows, setSimSpecificRows ] = useState( [] );
  const [ sharedRows, setSharedRows ] = useState( [] );
  const [ commonRows, setCommonRows ] = useState( [] );

  // Populate sim-specific and common rows.
  useEffect( () => {

    // Since we have three different "categories" for strings, sim-specific, shared between sims (but not in the common
    // repos list), and finally common strings shared between many sims, we iterate over those categories, and create
    // different rows for the tables for each category.
    for ( const translationFormKey of Object.values( KeyTypesEnum ) ) {
      for ( const stringKeyWithoutDots in props.translationFormData[ translationFormKey ] ) {
        const englishString = props.translationFormData[ translationFormKey ][ stringKeyWithoutDots ].english;
        const stringKeyWithDots = stringKeyWithoutDots.split( '_DOT_' ).join( '.' );
        const jsx = (
          <TranslationFormRow
            key={stringKeyWithDots}
            keyWithoutDots={stringKeyWithoutDots}
            name={`${translationFormKey}.${stringKeyWithoutDots}.translated`}
            stringKey={stringKeyWithDots}
            englishString={englishString}
            locale={props.locale}
          />
        );
        if ( translationFormKey === KeyTypesEnum.SIM_SPECIFIC ) {
          setSimSpecificRows( simSpecificRows => [ ...simSpecificRows, jsx ] );
        }
        else if ( translationFormKey === KeyTypesEnum.SHARED ) {
          setSharedRows( sharedRows => [ ...sharedRows, jsx ] );
        }
        else if ( translationFormKey === KeyTypesEnum.COMMON ) {
          setCommonRows( commonRows => [ ...commonRows, jsx ] );
        }
      }
    }
  }, [ props.translationFormData ] ); // Re-render if there are errors.

  const prototypeWarningStyle = {
    color: 'red',
    fontStyle: 'bold'
  };
  const prototypeWarningJsx = (
    <p style={prototypeWarningStyle}>
      Warning — This simulation is currently a prototype.
      Changes may occur by the time the simulation is fully published
      that may include new strings or will require some strings to be
      re-translated.
    </p>
  );

  const sharedJsx = sharedRows.length > 0 ? (
    <div className='mt-2'>
      <h2>Shared Strings</h2>
      <h4 className='text-muted'>Translating these strings will affect a handful of simulations.</h4>
      <table className='table table-striped'>
        <thead>
        <tr>
          <th>String Key</th>
          <th>English String</th>
          <th>Translation</th>
        </tr>
        </thead>
        <tbody>

        {/* Iterate over the shared rows. */}
        {sharedRows}
        </tbody>
      </table>
    </div>
  ) : <></>;

  return (
    <div>
      <div className='mt-2'>
        <h2>Sim-Specific Strings</h2>
        {props.translationFormData.simIsPrototype ? prototypeWarningJsx : <></>}
        <h4 className='text-muted'>Translating these strings will only affect the selected simulation.</h4>
        <table className='table table-striped'>
          <thead>
          <tr>
            <th>String Key</th>
            <th>English String</th>
            <th>Translation</th>
          </tr>
          </thead>
          <tbody>

          {/* Iterate over the sim-specific rows. */}
          {simSpecificRows}
          </tbody>
        </table>
      </div>
      {sharedJsx}
      <div className='mt-2'>
        <h2>Common Strings</h2>
        <h4 className='text-muted'>Translating these strings will affect many simulations.</h4>
        <table className='table table-striped'>
          <thead>
          <tr>
            <th>String Key</th>
            <th>English String</th>
            <th>Translation</th>
          </tr>
          </thead>
          <tbody>

          {/* Iterate over the common rows. */}
          {commonRows}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TranslationFormTables;