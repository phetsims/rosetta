// Copyright 2022, University of Colorado Boulder

/**
 * Create a function that checks whether a given translated value in the translation form has a valid brace pattern.
 * The brace patterns are used in PhET sims for strings that can be filled in with variables.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { DOUBLE_BRACE_REGEX, SINGLE_BRACE_REGEX, TRIPLE_BRACE_REGEX } from '../../common/constants';

/**
 * Return a boolean telling whether a given value has a valid brace pattern.
 */
const isValidBracePattern = ( translatedValue: string, englishValue: string ): boolean => {
  if ( translatedValue === undefined ) {

    // If the user hasn't supplied a translation yet.  This is considered valid.
    return true;
  }

  let isValid = false;

  // Get arrays of single and double brace expressions. These brace expressions check for braces and content between the
  // braces.
  const englishSingleBraces = englishValue.match( SINGLE_BRACE_REGEX ) || [];
  const englishDoubleBraces = englishValue.match( DOUBLE_BRACE_REGEX ) || [];
  const translatedSingleBraces = translatedValue.match( SINGLE_BRACE_REGEX ) || [];
  const translatedDoubleBraces = translatedValue.match( DOUBLE_BRACE_REGEX ) || [];
  const translatedTripleBraces = translatedValue.match( TRIPLE_BRACE_REGEX ) || [];

  const hasSingleBraces = englishSingleBraces.length > 0;
  const hasDoubleBraces = englishDoubleBraces.length > 0;

  // Make sure the translated version accidentally does not do triple braces
  const translationHasTripleBraces = translatedTripleBraces.length > 0;

  // Generally, there should only be one type of braces, so both of these should be true, though one will generally be
  // working with zero-length arrays.
  const numSingleBracesIsSame = englishSingleBraces.length === translatedSingleBraces.length;
  const numDoubleBracesIsSame = englishDoubleBraces.length === translatedDoubleBraces.length;

  if ( numSingleBracesIsSame && numDoubleBracesIsSame && !translationHasTripleBraces ) {
    let numMatches = 0;
    const braceExprList = hasSingleBraces ? englishSingleBraces :
                          hasDoubleBraces ? englishDoubleBraces :
                            [];
    if ( braceExprList ) {
      for ( const braceExpr of braceExprList ) {
        if ( translatedSingleBraces.includes( braceExpr as never ) ) {
          numMatches++;
        }
        else if ( translatedDoubleBraces.includes( braceExpr as never ) ) {
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