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

async function getUserData( request, loginCookie ) {
  const url = `${request.get( 'host' )}/services/check-login`;
  const config = {
    headers: {
      'Cookie': `JSESSIONID=${loginCookie}`
    }
  };
  return await axios.get( url, config );
}

async function sessionShouldBeCreated( request, response, loginCookie ) {
  const userData = await getUserData( request, loginCookie );
  if ( userData && userData.loggedIn ) {
    if ( isTranslatorOrTeamMember( request, response, userData ) ) {
      return true;
    }
  }
  else {
    sendUserToLoginPage( response, request.get( 'host' ), request.url );
  }
  return false;
}

function isTranslatorOrTeamMember( response, userData ) {
  if ( userData.trustedTranslator || userData.teamMember ) {
    return true;
  }
  return false;
}

function createSession( request, loginCookie ) {
  const userData = getUserData( request, loginCookie );
  request.session.cookie.expires = null; // Browser session.
  request.session.email = userData.email;
  request.session.jSessionId = loginCookie; // To verify user is still logged in.
  request.session.teamMember = userData.teamMember;
  request.session.translatedStrings = {}; // For storing string history across submissions.
  request.session.trustedTranslator = userData.trustedTranslator;
  request.session.userId = userData.userId;
  request.session.username = userData.username;
}

function denyAccess( response ) {
  const message = '<h1>You must be a trusted translator or a team member to access this page.</h1>'
                  + '<p>Send an email to phethelp@gmail.com to request access.</p>';
  renderErrorPage( response, message, '' );
}

function handleStaleSessionCookie( request, response ) {
  winston.info( 'Session expired. Giving user option to log in.' );
  request.session.destroy( () => {
    const loginPageUrl = `https://${request.get( 'host' )}/en/sign-in?dest=${request.url}`;
    const message = '<h1>Your session has expired. Please log in again.</h1>'
                    + `<a href="${loginPageUrl}">Log in</a>`;
    const errorDetails = 'Login cookie is stale.';
    renderErrorPage( response, message, errorDetails );
  } );
}

/**
 * Algorithm
 * 1. Check if user is on localhost.
 *  - If so, bypass session validation.
 * 2. Check if user is logged in.
 *  - If not, send them to login page.
 * 3. Check if session cookie matches login cookie.
 *  - If not, handle stale session cookie.
 * 4. Check if there's a valid session in progress.
 *  - If not, check if one ought to be created.
 *    + If not, deny access.
 */

async function ensureValidSession( request, response, next ) {

  // TODO: Take out debug statements when done.
  winston.debug( `session cookie = ${request.session.jSessionId}` );
  winston.debug( `login cookie = ${request.cookies.JSESSIONID}` );

  const userIsOnLocalhost = request.get( 'host' ).indexOf( 'localhost' ) === 0;
  const loginCookie = request.cookies.JSESSIONID;
  const userIsLoggedIn = !( loginCookie === undefined );
  const sessionCookieMatchesLoginCookie = request.session.jSessionId && request.session.jSessionId === loginCookie;
  const validSessionInProgress = request.session.trustedTranslator || request.session.teamMember;

  if ( userIsOnLocalhost ) {
    bypassSessionValidation( response, next );
  }

  if ( userIsLoggedIn ) {
    if ( sessionCookieMatchesLoginCookie ) {
      if ( validSessionInProgress ) {
        next();
      }
      else {
        if ( await sessionShouldBeCreated( request, response, loginCookie ) ) {
          createSession( request, loginCookie );
        }
        else {
          denyAccess( response );
        }
      }
    }
    else {
      handleStaleSessionCookie( request, response );
    }
  }
  else {
    sendUserToLoginPage( response, request.get( 'host' ), request.url );
  }
}

module.exports = ensureValidSession;
