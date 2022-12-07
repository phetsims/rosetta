// Copyright 2022, University of Colorado Boulder

/**
 * Create a function to validate sim names.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';

/**
 * Tell whether a sim is in the list of sim names.
 *
 * @param simName - lowercase kebab-case sim name, e.g. acid-base-solutions
 * @returns {Boolean}
 */
const isValidSimName = async simName => {
  const simMetadata = await getSimMetadata();
  const listOfSimNames = Object.keys( getSimNamesAndTitles( simMetadata ) );
  let ret = false;
  if ( listOfSimNames.includes( simName ) ) {
    ret = true;
  }
  return ret;
};

export default isValidSimName;