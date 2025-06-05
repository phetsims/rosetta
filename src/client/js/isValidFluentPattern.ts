// Copyright 2025, University of Colorado Boulder

/**
 * Create a function that checks whether a given translated value in the translation form has a valid
 * Fluent pattern. Fluent is the tool used in PhET for long translations.
 *
 * TODO: Implement this function to check the validity of Fluent patterns. https://github.com/phetsims/rosetta/issues/464
 *
 * @author Agustín Vallejo
 */

// import { getFluentParams } from '../../../../chipper/js/grunt/modulify/getFluentParams.js';

/**
 * Return a boolean telling whether a given value has a valid Fluent pattern.
 */
const isValidFluentPattern = ( translatedValue: string, englishValue: string ): boolean => {
  if ( translatedValue === undefined ) {

    // If the user hasn't supplied a translation yet.  This is considered valid.
    return true;
  }

  return true;

  // const englishValueParamInfo = getFluentParams( englishValue, englishValue );
  // const translatedValueParamInfo = getFluentParams( translatedValue, translatedValue );
  //
  // // Return if the parameters match
  // return englishValueParamInfo.length === translatedValueParamInfo.length &&
  //        englishValueParamInfo.every( ( param, index ) => {
  //          const translatedParam = translatedValueParamInfo[ index ];
  //          return param.name === translatedParam.name &&
  //                 ( !param.variants || !translatedParam.variants ||
  //                   param.variants.length === translatedParam.variants.length &&
  //                   param.variants.every( ( variant, variantIndex ) =>
  //                     variant === translatedParam.variants![ variantIndex ] ) );
  //        } );
};

export default isValidFluentPattern;