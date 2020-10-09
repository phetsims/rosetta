// Copyright 2020, University of Colorado Boulder

/**
 * In this file, we use the built-in Node HTTPS module to make a function that allows us to get a JSON object. We chose
 * this approach over using Node Fetch or Axios or something similar because we don't want a ton of third-party
 * libraries that slowly become outdated or deprecated or obscure. (Rosetta isn't updated or maintained with a great
 * deal of regularity, so we want it to be as future-proof as possible.)
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// Modules
const https = require( 'https' );
const winston = require( 'winston' );

/**
 * This function accepts a URL, an options object, and a regular expression for the expected content type. It should
 * return a promise to return a JSON object.
 *
 * @param url - the location of the JSON object you want to get
 * @param options - the object that the built-in Node HTTP and HTTPS requests accept
 * @param expectedContentType - the regular expression for the expected content type
 * @returns {Promise<Object>} - the JSON object
 */
async function getJsonObject( url, options, expectedContentType ) {

  // The function returns a promise to resolve the JSON object. Thus, you need to use await when you call the function.
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
        reject( badStatusCodeError ); // TODO: We should be able to simply throw badStatusCodeError here. See https://github.com/phetsims/rosetta/issues/231#issuecomment-706420799.
      }
      else if ( !expectedContentType.test( contentType ) ) {
        const badContentTypeError = new Error( `Invalid content type. Expected ${expectedContentType} but received ${contentType}` );
        winston.error( badContentTypeError.message );
        reject( badContentTypeError ); // TODO: We should be able to simply throw badContentTypeError here. See https://github.com/phetsims/rosetta/issues/231#issuecomment-706420799.
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
          const parsedData = JSON.parse( rawData );
          resolve( parsedData ); // TODO: We should be able to simply return parsedData here. See https://github.com/phetsims/rosetta/issues/231#issuecomment-706420799.
        }
        catch( error ) {
          const parseJsonError = new Error( `Parsing JSON failed. ${error.message}` );
          winston.error( parseJsonError.message );
          reject( parseJsonError ); // TODO: We should be able to simply throw parseJsonError here. See https://github.com/phetsims/rosetta/issues/231#issuecomment-706420799.
        }
      } );
    } );

    // Reject errors and finish sending the request.
    request.on( 'error', error => {
      reject( error ); // TODO: We should be able to simply throw new Error( toString( error ) ) here. See https://github.com/phetsims/rosetta/issues/231#issuecomment-706420799.
    } );
    request.end();
  } );
}

module.exports = getJsonObject;