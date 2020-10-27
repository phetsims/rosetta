// Copyright 2020, University of Colorado Boulder

/**
 * In this file, we use the built-in Node HTTPS module to make a function that allows us to get a web resource. We
 * chose this approach over using Node Fetch or Axios or something similar because we don't want a ton of third-party
 * libraries that slowly become outdated or deprecated or obscure. (Rosetta isn't updated or maintained with a great
 * deal of regularity, so we want it to be as future-proof as possible.)
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// modules
const https = require( 'https' );
const winston = require( 'winston' );

/**
 * This function performs a simple get request using the Node's built-in HTTPS request.
 *
 * @param {string} url - the location of the web resource you want to get
 * @param {Object} [options] - the object that the built-in Node HTTP and HTTPS requests accept
 * @param {RegExp} expectedContentType - the regular expression for the expected content type
 * @returns {Promise<?>} - the web resource
 */
async function getResource( url, options, expectedContentType ) {

  // The function explicitly returns a promise to resolve the web resource.
  return new Promise( ( resolve, reject ) => {

    // Here, we have the built-in Node HTTPS request function.
    const request = https.request( url, options, response => {

      // Set up variables for error logging.
      const { statusCode } = response;
      const contentType = response.headers[ 'content-type' ];

      // Log incorrect return codes or incorrect content type.
      if ( statusCode !== 200 ) {
        const badStatusCodeError = new Error( `HTTPS request failed. Status code: ${statusCode}` );
        winston.error( badStatusCodeError.message );
        reject( badStatusCodeError );
      }
      else if ( !expectedContentType.test( contentType ) ) {
        const badContentTypeError = new Error( `Invalid content type. Expected ${expectedContentType} but received ${contentType}` );
        winston.error( badContentTypeError.message );
        reject( badContentTypeError );
      }

      // Set encoding and variable for the raw data.
      response.setEncoding( 'utf-8' );
      let rawData = '';

      // Add data chunks.
      response.on( 'data', chunk => {
        rawData += chunk;
      } );

      // Parse and resolve the JSON object.
      response.on( 'end', () => {
        try {
          resolve( rawData );
        }
        catch( error ) {
          const resolveError = new Error( `Attempt to resolve rawData failed. ${error.message}` );
          winston.error( resolveError.message );
          reject( resolveError );
        }
      } );
    } );

    // Reject errors and finish sending the request.
    request.on( 'error', error => {
      reject( error );
    } );
    request.end();
  } );
}

module.exports = getResource;