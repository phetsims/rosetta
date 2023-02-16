// Copyright 2022, University of Colorado Boulder

/**
 * Create a function to validate sim names.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import getSimMetadata from '../getSimMetadata.js';
import getSimNamesAndTitles from '../getSimNamesAndTitles.js';
import logger from '../logger.js';

/**
 * Tell whether a sim is in the list of sim names.
 *
 * @param simName - lowercase kebab-case sim name, e.g. acid-base-solutions
 * @returns {Promise.<Boolean>}
 */
const isValidSimName = async simName => {
  logger.info( `checking if ${simName} is valid` );
  const simMetadata = await getSimMetadata();
  const listOfSimNames = Object.keys( getSimNamesAndTitles( simMetadata, 'true' ) );
  let isValid = false;
  if ( listOfSimNames.includes( simName ) ) {
    isValid = true;
  }
  logger.info( `${simName} is valid = ${isValid}` );
  return isValid;
};

export default isValidSimName;