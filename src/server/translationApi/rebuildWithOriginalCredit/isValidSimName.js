// Copyright 2022, University of Colorado Boulder

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';

/**
 * Tell whether a sim is in the list of sim names.
 *
 * @param simName - lowercase kebab-case sim name, e.g. acid-base-solutions
 * @returns {boolean}
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