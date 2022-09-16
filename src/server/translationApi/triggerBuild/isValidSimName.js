// Copyright 2022, University of Colorado Boulder

import getSimNames from '../getSimNames.js';

/**
 * Tell whether a sim is in the list of sim names.
 *
 * @param simName - lowercase kebab-case sim name, e.g. acid-base-solutions
 * @return {boolean}
 */
const isValidSimName = async simName => {
  const listOfSimNames = await getSimNames();
  let ret = false;
  if ( listOfSimNames.includes( simName ) ) {
    ret = true;
  }
  return ret;
};

export default isValidSimName;