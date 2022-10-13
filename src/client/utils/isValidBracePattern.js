// Copyright 2022, University of Colorado Boulder

// const SINGLE_BRACE_PATTERN_REGULAR_EXP = /\{\d+\}/g;
// const DOUBLE_BRACE_PATTERN_REGULAR_EXP = /\{\{\w+\}\}/g;

const isValidBracePattern = ( translatedValue, englishValue ) => {

  //debugger; // eslint-disable-line no-debugger
  let ret = false;
  if ( translatedValue === undefined ) {
    ret = true;
  }
  console.log( `englishValue = ${englishValue}` );
  console.log( `translatedValue = ${translatedValue}` );
  return ret;
};

export default isValidBracePattern;