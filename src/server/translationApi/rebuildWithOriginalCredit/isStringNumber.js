// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that tells whether a string is a string number.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from '../logger.js';

/**
 * Helper function. !isNaN is confusing, hence this function.
 *
 * @param {String} stringToTest - a string number like "123"
 * @returns {Boolean}
 */
const isStringNumber = stringToTest => {
  if ( typeof stringToTest === 'string' ) {
    return !isNaN( stringToTest );
  }
  else {
    logger.error( `isStringNumber was called with parameter type ${typeof stringToTest}; returning false` );
    return false;
  }
};

export default isStringNumber;