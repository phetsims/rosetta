// Copyright 2023, University of Colorado Boulder

const STRINGS_REGEX = /^window.phet.chipper.strings/;

/**
 * Extract the string keys and values from the HTML file that represents a sim
 * @param {string} simUrl
 * @returns {Promise<Object>} an object with the strings in the format used by PhET's sims
 */
module.exports = async function getStringsFromSim( simUrl ) {
  const response = await fetch( simUrl );
  const html = await response.text();
  const htmlLines = html.split( '\n' );
  let stringsObject = {};
  for ( const line of htmlLines ) {
    if ( line.match( STRINGS_REGEX ) ) {
      const stringJson = line.replace( 'window.phet.chipper.strings = ', '' ).replace( '}};', '}}' );
      stringsObject = JSON.parse( stringJson );
      break;
    }
  }
  return stringsObject;
};