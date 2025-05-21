// Copyright 2022, University of Colorado Boulder

/**
 * Sends an error message to the server.
 *
 * @author Agustín Vallejo
 */

import { TRANSLATION_API_ROUTE } from '../../common/constants';

/**
 * @param error - the error message to be sent to the server
 */
async function logError( error: string ): Promise<Response> {
  // Attempt to notify the server of the error
  return fetch( `${TRANSLATION_API_ROUTE}/logClientError`, {
    method: 'POST', // HTTP method
    headers: {
      'Content-Type': 'application/json' // Specify JSON content
    },
    body: JSON.stringify( {
      errorMessage: error.toString()
    } )
  } );
}

export default logError;