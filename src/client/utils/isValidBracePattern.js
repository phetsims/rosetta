// Copyright 2022, University of Colorado Boulder

import clientConstants from './clientConstants.js';

const isValidBracePattern = ( translatedValue, englishValue ) => {
  if ( translatedValue === undefined ) {

    // If the user hasn't supplied a translation yet, the value will be undefined.
    // We want blank translations to be valid. We can bail at this point.
    return true;
  }

  let isValid = false;

  // Get arrays of single and double brace expressions.
  // These brace expressions check for braces and content between the braces.
  const englishSingleBraces = englishValue.match( clientConstants.singleBraceRegex ) || [];
  const englishDoubleBraces = englishValue.match( clientConstants.doubleBraceRegex ) || [];
  const translatedSingleBraces = translatedValue.match( clientConstants.singleBraceRegex ) || [];
  const translatedDoubleBraces = translatedValue.match( clientConstants.doubleBraceRegex ) || [];

  // Set up booleans.
  const hasSingleBraces = englishSingleBraces.length > 0;
  const hasDoubleBraces = englishDoubleBraces.length > 0;
  const numSingleBracesIsSame = englishSingleBraces.length === translatedSingleBraces.length;
  const numDoubleBracesIsSame = englishDoubleBraces.length === translatedDoubleBraces.length;

  if ( hasSingleBraces && numSingleBracesIsSame ) {
    isValid = true;
  }
  else if ( hasDoubleBraces && numDoubleBracesIsSame ) {
    isValid = true;
  }

  return isValid;
};

export default isValidBracePattern;