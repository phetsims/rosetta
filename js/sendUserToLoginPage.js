// Copyright 2020, University of Colorado Boulder

/**
 * Send the user to PhET's login page. We don't hard code the login URL in case it changes.
 *
 * @author Liam Mulhall
 */

function sendUserToLoginPage( response, host, destinationUrl ) {
  response.render( 'login-required.html', {
    title: 'Login Required',
    host: host,
    destinationUrl: destinationUrl
  } );
}

module.exports = sendUserToLoginPage;
