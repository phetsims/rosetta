// Copyright 2020, University of Colorado Boulder

/**
 * Renders an error page.
 *
 * @author Liam Mulhall
 */

function renderErrorPage( response, message, errorDetails ) {
  response.render( 'error.html', {
    title: 'Translation Utility Error',
    message: message,
    errorDetails: errorDetails,
    timestamp: new Date.getTime()
  } );
}

module.exports = renderErrorPage;