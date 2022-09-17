// Copyright 2021, University of Colorado Boulder

/**
 * We define the sim select.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';

/**
 * This component is a select (commonly referred to as a dropdown) for sims.
 *
 * @param {Object} field - props used by Formik
 * @returns {JSX.Element}
 * @constructor
 */
const SimSelect = ( { field } ) => { // eslint-disable-line react/prop-types

  // for storing and setting sim names
  const [ simNames, setSimNames ] = useState( [] );
  const [ simTitles, setSimTitles ] = useState( [] );

  // get sim names
  useEffect( async () => {
    try {
      const simNamesRes = await axios.get( '/translationApi/simNames' );
      setSimNames( simNamesRes.data );
      const simTitlesRes = await axios.get( '/translationApi/simTitles' );
      setSimTitles( simTitlesRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  // create a list of sim options to iterate over
  const simOptions = [];
  for ( let i = 0; i < simNames.length; i++ ) {
    simOptions.push(
      <option
        key={simNames[ i ]}
        value={simNames[ i ]}
      >
        {simTitles[ i ]}
      </option>
    );
  }

  // use the spread operator to give the select each of the props in the field object
  return (
    <select {...field}>

      {/* iterate over sim options */}
      {simOptions}
    </select>
  );
};

export default SimSelect;