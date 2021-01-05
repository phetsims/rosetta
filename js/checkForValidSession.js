// Copyright 2020, University of Colorado Boulder

/**
 * TODO: Finish JSDoc.
 *
 * @author Liam Mulhall
 */

// modules
const axios = require( 'axios' );
const renderErrorPage = require( './renderErrorPage' );
const sendUserToLoginPage = require( './sendUserToLoginPage' );
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

async function getUserData( request, cookie ) {
  const url = `${request.get( 'host' )}/services/check-login`;
  const config = {
    headers: {
      'Cookie': `JSESSIONID=${cookie}`
    }
  };
  return await axios.get( url, config );
}

function handleStaleCookie( request, response ) {
  winston.info( 'Session expired. Giving user option to log in.' );
  request.session.destroy( () => {
    const loginPageUrl = 'https://phet.colorado.edu/translate';
    const message = '<h1>Your session has expired. Please log in again.</h1>'
                    + `<a href="${loginPageUrl}">Log in</a>`;
    const errorDetails = 'Login cookie is stale.';
    renderErrorPage( response, message, errorDetails );
  } );
}

function createSession( request, userData, cookie ) {
  request.session.cookie.expires = null; // Browser session.
  request.session.email = userData.email;
  request.session.jSessionId = cookie; // To verify user is still logged in.
  request.session.teamMember = userData.teamMember;
  request.session.translatedStrings = {}; // For storing string history across submissions.
  request.session.trustedTranslator = userData.trustedTranslator;
  request.session.userId = userData.userId;
  request.session.username = userData.username;
}

function isTranslatorOrTeamMember( response, userData ) {
  if ( userData.trustedTranslator || userData.teamMember ) {
    return true;
  }
  else {
    const message = '<h1>You must be a trusted translator or a team member to access this page.</h1>'
                    + '<p>Send an email to phethelp@gmail.com to request access.</p>';
    renderErrorPage( response, message, '' );
  }
}

/**
 * TODO: Break up checkForLoginCookie into smaller functions that do only one thing using the following algorithm.
 * 1. Check to see if the login cookie exists.
 * 2. If it's stale, handle it.
 * 3. If it's fresh, check to see if there's a session in progress.
 * 4. If there's a session in progress, send the user along.
 * 5. If there isn't a session in progress, we need to set it up if the user is a translator or team member.
 */

async function checkForLoginCookie( request, response, next ) {

  winston.info( 'Checking for login cookie.' );

  const cookie = request.cookies.JSESSIONID;
  const cookieIsPresent = !( cookie === undefined );
  const sessionInProgress = request.session.trustedTranslator || request.session.teamMember;
  const cookieIsStale = request.session.jSessionId && request.session.jSessionId !== cookie;

  if ( cookieIsPresent ) {
    if ( cookieIsStale ) {
      handleStaleCookie( request, response );
    }
    else {
      if ( sessionInProgress ) {
        next();
      }
      else {
        const userData = await getUserData( request, cookie );
        if ( userData && userData.loggedIn ) {
          if ( isTranslatorOrTeamMember( response, userData ) ) {
            createSession( request, userData, cookie );
          }
        }
        else {
          sendUserToLoginPage( response, request.get( 'host' ), request.url );
        }
      }
    }
  }
  else {
    winston.info( 'Session cookie not found. Sending user to login page.' );
    sendUserToLoginPage( response, request.get( 'host' ), request.url );
  }
}

async function checkForValidSession( request, response, next ) {

  const userIsOnLocalhost = request.get( 'host' ).indexOf( 'localhost' ) === 0;
  if ( userIsOnLocalhost ) {
    bypassSessionValidation( request, next );
  }

  await checkForLoginCookie( request, response, next );
}

module.exports = checkForValidSession;
