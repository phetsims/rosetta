// Copyright 2020, University of Colorado Boulder

/**
 * In this file, we define a function that allows us to post a JSON object to a server using the built-in Node HTTPS
 * module. We chose this approach over using Node Fetch or Axios because we'd like to minimize our dependence on
 * third-party libraries. Rosetta probably won't be maintained with a great deal of regularity, so we're trying to make
 * it as future-proof as possible.
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

// modules
const https = require( 'https' );
const winston = require( 'winston' );

/**
 * This function performs a simple post using Node's built-in HTTPS module.
 *
 * @param {Object} resource - the resource we're posting
 * @param {Object} [options] - the object that the built-in Node HTTP and HTTPS requests accept
 * @returns {Promise<void>} - we don't return anything
 */
async function postResource( resource, options ) {

  // The function explicitly returns a promise to resolve.
  return new Promise( ( resolve, reject ) => {

    // Make the request with the options object. The options object should contain the URL and the path.
    const request = https.request( options, response => {

      // If status code is bad, tell user.
      const { statusCode } = response;
      if ( statusCode !== 200 || statusCode !== 202 ) {
        winston.error( `HTTPS post request failed. statusCode: ${statusCode}` );
      }

      // Log data chunks. Not sure how useful this will be in non-debug context, so putting in debug logs for now.
      response.on( 'data', data => {
        winston.debug( data );
      } );

      // Try to resolve.
      response.on( 'end', () => {
        try {
          resolve();
        }
        catch( error ) {
          const resolveError = new Error( `Attempt to resolve failed. ${error.message}` );
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

module.exports = postResource;