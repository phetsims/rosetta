// Copyright 2022, University of Colorado Boulder

/**
 * Create a function that checks whether a given translated value in the translation form has a valid brace pattern.
 * The brace patterns are used in PhET sims to insert variables (I think -- I (Liam) am not a sim developer).
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import publicConfig from '../../common/publicConfig.js';

/**
 * Return a boolean telling whether a given value has a valid brace pattern.
 *
 * @param {String} translatedValue - the user-inputted translated value
 * @param {String} englishValue - the original English value
 * @returns {Boolean} - whether the brace pattern is valid
 */
const isValidBracePattern = ( translatedValue, englishValue ) => {
  if ( translatedValue === undefined ) {

    // If the user hasn't supplied a translation yet, the value will be undefined.
    // We want blank translations to be valid. We can bail at this point.
    return true;
  }

  let isValid = false;

  // Get arrays of single and double brace expressions.
  // These brace expressions check for braces and content between the braces.
  const englishSingleBraces = englishValue.match( publicConfig.singleBraceRegex ) || [];
  const englishDoubleBraces = englishValue.match( publicConfig.doubleBraceRegex ) || [];
  const translatedSingleBraces = translatedValue.match( publicConfig.singleBraceRegex ) || [];
  const translatedDoubleBraces = translatedValue.match( publicConfig.doubleBraceRegex ) || [];

  const hasSingleBraces = englishSingleBraces.length > 0;
  const hasDoubleBraces = englishDoubleBraces.length > 0;

  // Generally, there should only be one type of braces, so both of these should be true.
  // One of them is working with arrays of length zero.
  const numSingleBracesIsSame = englishSingleBraces.length === translatedSingleBraces.length;
  const numDoubleBracesIsSame = englishDoubleBraces.length === translatedDoubleBraces.length;

  if ( numSingleBracesIsSame && numDoubleBracesIsSame ) {
    let numMatches = 0;
    const braceExprList = hasSingleBraces ? englishSingleBraces :
                          hasDoubleBraces ? englishDoubleBraces :
                          null;
    if ( braceExprList ) {
      for ( const braceExpr of braceExprList ) {
        if ( translatedSingleBraces.includes( braceExpr ) ) {
          numMatches++;
        }
        else if ( translatedDoubleBraces.includes( braceExpr ) ) {
          numMatches++;
        }
      }
      if ( numMatches === braceExprList.length ) {
        isValid = true;
      }
    }
  }

  return isValid;
};

export default isValidBracePattern;