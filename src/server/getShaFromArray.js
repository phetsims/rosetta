// Copyright 2022, University of Colorado Boulder
/* eslint-disable consistent-return */

/**
 * Export a function that (should) return a SHA1 from an array of strings if one exists in the array.
 *
 * @author Liam Mulhall
 */

/**
 * Return either the SHA1 in the array provided or return 'no sha' if one doesn't exist in the array provided.
 *
 * @param {Array<String>} array - array of strings
 * @returns {String} - SHA1
 */
const getShaFromArray = array => {
  for ( const item of array ) {
    if ( item.length === 40 ) {
      const hexRegex = /[0-9A-Fa-f]{6}/g;
      if ( hexRegex.test( item ) ) {
        return item;
      }
      else {
        return 'no sha';
      }
    }
  }
};

export default getShaFromArray;