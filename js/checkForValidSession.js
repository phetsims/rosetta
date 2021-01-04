// Copyright 2020, University of Colorado Boulder

/**
 * TODO: Finish JSDoc.
 *
 * @author Liam Mulhall
 */

// modules
// const sendUserToLoginPage = require( './sendUserToLoginPage' );
const winston = require( 'winston' );

/**
 * TODO: Finish JSDoc.
 *
 * @param request
 * @param next
 */
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

/**
 * TODO: Finish JSDoc.
 *
 * @param request
 */
function checkForLoginCookie( request, response ) {

  winston.info( 'Checking for login cookie.' );

  // const cookie = request.cookies.JSESSIONID;
  // const cookieIsPresent = !( cookie === undefined );
  // const userIsTranslatorOrTeamMember = request.session.trustedTranslator || request.session.teamMember;
  // const cookieIsStale = request.session.jSessionId && request.session.jSessionId !== cookie;

  // if ( cookieIsPresent ) {
  //   if ( cookieIsStale ) {
  //     winston.info( 'Session expired. Forcing user to log in again.' );
  //     request.session.destroy( () => {
  //       const message = '';
  //       const errorDetails = '';
  //       renderErrorPage( response, message, errorDetails ); // TODO: Make new module and replace the old one in TranslationUtils.js and the other function on line 696 in routeHandlers.js.
  //     } );
  //   }
  // }
  // else {
  //   winston.info( 'Session cookie not found. Sending user to login page.' );
  //   sendUserToLoginPage( response, request.get( 'host' ), request.url );
  // }
}

/**
 * TODO: Finish JSDoc.
 *
 * @param request
 * @param response
 * @param next
 */
function checkForValidSession( request, response, next ) {

  const userIsOnLocalhost = request.get( 'host' ).indexOf( 'localhost' ) === 0;
  if ( userIsOnLocalhost ) {
    bypassSessionValidation( request, next );
  }

  checkForLoginCookie( request );
}

module.exports = checkForValidSession;