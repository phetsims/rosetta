// Copyright 2022, University of Colorado Boulder

import clientConstants from './clientConstants.js';

// const globalSingleBraceRegex = new RegExp( clientConstants.singleBraceRegex, 'g' );
// const globalDoubleBraceRegex = new RegExp( clientConstants.doubleBraceRegex, 'g' );

const isValidBracePattern = ( translatedValue, englishValue ) => {
  let ret = false;
  if ( translatedValue === undefined ) {
    ret = true;
  }
  const singleBracePlaceHolders = englishValue.match( clientConstants.singleBraceRegex ) || [];
  const doubleBracePlaceHolders = englishValue.match( clientConstants.doubleBraceRegex ) || [];
  console.log( `englishValue = ${englishValue}` );
  console.log( `translatedValue = ${translatedValue}` );
  console.log( `single braces = ${Array.isArray( singleBracePlaceHolders )}` );
  console.log( `double braces = ${Array.isArray( doubleBracePlaceHolders )}` );
  return ret;
};

export default isValidBracePattern;