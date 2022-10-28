// Copyright 2021, University of Colorado Boulder

/**
 * We define the sim select.
 *
 * @author Liam Mulhall
 */

import { useContext } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import { SimNamesContext, SimTitlesContext } from './RosettaRoutes.jsx';

/**
 * This component is a select (commonly referred to as a dropdown) for sims.
 *
 * @param {Object} field - props used by Formik
 * @returns {JSX.Element}
 * @constructor
 */
const SimSelect = ( { field } ) => {

  const simNames = useContext( SimNamesContext );
  const simTitles = useContext( SimTitlesContext );

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

  let jsx;
  if ( simOptions.length === 0 ) {
    jsx = <LoadingSpinner/>;
  }
  else {

    // use the spread operator to give the select each of the props in the field object
    jsx = (
      <select {...field}>

        {/* iterate over sim options */}
        {simOptions}
      </select>
    );
  }
  return jsx;
};

export default SimSelect;