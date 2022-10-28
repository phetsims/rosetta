// Copyright 2021, University of Colorado Boulder

/**
 * We define the sim select.
 *
 * @author Liam Mulhall
 */

import useSimNames from '../hooks/useSimNames.jsx';
import useSimTitles from '../hooks/useSimTitles.jsx';

/**
 * This component is a select (commonly referred to as a dropdown) for sims.
 *
 * @param {Object} field - props used by Formik
 * @returns {JSX.Element}
 * @constructor
 */
const SimSelect = ( { field } ) => { // eslint-disable-line react/prop-types

  const simNames = useSimNames();
  const simTitles = useSimTitles();

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