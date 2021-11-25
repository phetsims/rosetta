// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import React, { useEffect, useState } from 'react';

const SimSelect = ( { field } ) => { // eslint-disable-line react/prop-types

  const [ simNames, setSimNames ] = useState( [] );

  useEffect( async () => {
    try {
      const simNamesRes = await axios.get( '/translate/api/simNames' );
      setSimNames( simNamesRes.data );
    }
    catch( e ) {
      console.error( e );
    }
  }, [] );

  const simOptions = [];
  for ( const simName of simNames ) {
    simOptions.push(
      <option
        key={simName}
        value={simName}
      >
        {simName.replaceAll( '-', ' ' )}
      </option>
    );
  }

  return (
    <select {...field}>
      {simOptions}
    </select>
  );
};

export default SimSelect;