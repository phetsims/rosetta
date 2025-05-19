// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that tells the user about an error.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logError from './logError';

/**
 * Alert the user that an error occurred.
 *
 * @param error - the error message to be displayed
 */
async function alertErrorMessage( error: string ): Promise<Response> {
  // Attempt to notify the server of the error
  const response = logError( error );

  window.alert(
    `The translation utility experienced an error.
    
    Please contact phethelp@colorado.edu and include the error message below.
    
    ${error}`
  );

  return response;
}

export default alertErrorMessage;