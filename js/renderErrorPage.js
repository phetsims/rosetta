// Copyright 2021, University of Colorado Boulder

/**
 * Renders an error page.
 *
 * @author Liam Mulhall
 */
function renderErrorPage( response, message, errorDetails ) {
  response.render( 'error.html', {
    title: 'Translation Utility Error',
    message: message,
    timestamp: new Date().getTime(),
    errorDetails: errorDetails
  } );
}

module.exports = renderErrorPage;