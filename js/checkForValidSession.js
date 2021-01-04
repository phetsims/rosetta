// Copyright 2020, University of Colorado Boulder

/**
 * TODO: Add JSDoc description here.
 *
 * @author Liam Mulhall
 */

// modules
const winston = require( 'winston' );

function bypassSessionValidation( request, next ) {

  winston.warn( 'Bypassing session validation to allow testing on localhost.' );

  // Set up fake session data.
  request.session.teamMember = true;
  request.session.trustedTranslator = true;
  request.session.userId = 0;
  request.session.username = 'localhost-user';
  request.session.email = 'none';
  request.session.translatedStrings = {}; // For storing string history across submissions.
  request.session.jSessionId = request.cookies.JSESSIONID; // To verify user is still logged in.
  request.session.cookie.expires = null;

  return next();
}

function checkForValidSession( request, response, next ) {

  const userIsOnLocalhost = request.get( 'host' ).indexOf( 'localhost' ) === 0;
  if ( userIsOnLocalhost ) {
    bypassSessionValidation( request, next );
  }
}

module.exports = checkForValidSession;