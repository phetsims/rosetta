// Copyright 2023, University of Colorado Boulder

/**
 * @author John Blanco (PhET Interactive Simulations)
 */

const assert = require( './assert' );
const getTranslatedStringFileList = require( './getTranslatedStringFileList' );

/**
 * Get a list of all translated string files in the local copy of the babel repo for the provided locale.
 * @param {string} [locale]
 * @returns {string[]} list of relative path for translated string files
 */
module.exports = function getStringFileListForLocale( locale ) {

  // parameter checking
  assert( locale.length === 2 || locale.length === 5, `Invalid locale: ${locale}` );

  // Get a list of ALL string files.
  const listOfAllTranslatedStringFiles = getTranslatedStringFileList();

  // Pare down the list based on the provided locale.
  const testString = `${locale}.json`;
  return listOfAllTranslatedStringFiles.filter( fileName =>
    fileName.indexOf( testString ) > 0
  );
};