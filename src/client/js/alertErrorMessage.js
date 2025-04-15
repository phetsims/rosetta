// Copyright 2022, University of Colorado Boulder

/**
 * Export a function that tells the user about an error.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import axios from 'axios';
import { TRANSLATION_API_ROUTE } from '../../common/constants.js';

/**
 * Alert the user that an error occurred.
 *
 * @param error - the error message to be displayed
 */
async function alertErrorMessage( error ) {
  // Attempt to notify the server of the error
  const response = await axios.post( `${TRANSLATION_API_ROUTE}/logClientError`, {
    errorMessage: error.toString()
  } );

  window.alert(
    `The translation utility experienced an error.
    
    Please contact phethelp@colorado.edu and include the error message below.
    
    ${error}`
  );

  return response;
}

export default alertErrorMessage;