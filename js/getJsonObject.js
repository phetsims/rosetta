// Copyright 2020, University of Colorado Boulder

/**
 * In this file, we use the built-in Node HTTPS module to make a function that allows us to get a JSON object. We chose
 * this approach over using Node Fetch or Axios or something similar because we don't want a ton of third-party
 * libraries that slowly become outdated or deprecated or obscure. (Rosetta isn't updated or maintained with a great
 * deal of regularity, so we want it to be as future-proof as possible.)
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// modules
const getResource = require( './getResource' );
const winston = require( 'winston' );

/**
 * This function accepts a URL, an options object, and a regular expression for the expected content type. It should
 * return a promise to return a JSON object.
 *
 * @param {string} url - the location of the JSON object you want to get
 * @param {Object} [options] - the object that the built-in Node HTTP and HTTPS requests accept
 * @param {RegExp} expectedContentType - the regular expression for the expected content type
 * @returns {Promise<Object>} - the JSON object
 */
async function getJsonObject( url, options, expectedContentType ) {

  const rawData = await getResource( url, options, expectedContentType );

  try {
    const parsedData = JSON.parse( rawData );
    return parsedData;
  }
  catch( error ) {
    const parseJsonError = new Error( `Parsing JSON failed. ${error.message}` );
    winston.error( parseJsonError.message );
    throw parseJsonError;
  }
}

module.exports = getJsonObject;