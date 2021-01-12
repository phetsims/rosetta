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

async function getUserData( request, websiteCookie ) {
  const url = `${request.get( 'host' )}/services/check-login`;
  const options = {
    method: 'GET',
    headers: {
      'Cookie': `JSESSIONID=${websiteCookie}`
    },
    url: url
  };
  try {
    return await axios( options );
  }
  catch( error ) {
    winston.error( `Unable to get website user data. ${error}` );
  }
}

function handleStaleRosettaSession( request, response ) {
  winston.info( 'Session expired. Giving user option to log in.' );
  request.session.destroy( () => {
    const loginPageUrl = `https://${request.get( 'host' )}/en/sign-in?dest=${request.url}`;
    const message = '<h1>Your session has expired. Please log in again.</h1>'
                    + `<a href="${loginPageUrl}">Log in</a>`;
    const errorDetails = 'Login cookie is stale.';
    renderErrorPage( response, message, errorDetails );
  } );
}

function createRosettaSession( request, websiteCookie, websiteUserData ) {
  request.session.cookie.expires = null; // Browser session.
  request.session.email = websiteUserData.email;
  request.session.jSessionId = websiteCookie;
  request.session.teamMember = websiteUserData.teamMember;
  request.session.translatedStrings = {}; // For storing string history across submissions.
  request.session.trustedTranslator = websiteUserData.trustedTranslator;
  request.session.userId = websiteUserData.userId;
  request.session.username = websiteUserData.username;
}

function denyRosettaAccess( response ) {
  const message = '<h1>You must be a trusted translator or a team member to access this page.</h1>'
                  + '<p>Send an email to phethelp@gmail.com to request access.</p>';
  renderErrorPage( response, message, '' );
}

async function ensureValidSession( request, response, next ) {

  const userIsOnLocalhost = request.get( 'host' ).indexOf( 'localhost' ) === 0;
  if ( userIsOnLocalhost ) {
    bypassSessionValidation( response, next );
  }

  // Set up website session variables for later use.
  const websiteCookie = request.cookies.JSESSIONID;
  const websiteUserData = getUserData( request, websiteCookie );
  const userIsLoggedIn = websiteUserData ? websiteUserData.loggedIn : false;
  const userIsTranslatorOrTeamMember = websiteUserData.trustedTranslator || websiteUserData.teamMember;

  // Set up Rosetta session variables for later use.
  const rosettaCookie = request.session.jSessionId;
  const rosettaSessionIsFresh = ( rosettaCookie !== undefined ) && ( rosettaCookie === websiteCookie );
  const rosettaSessionIsStale = ( rosettaCookie !== undefined ) && ( rosettaCookie !== websiteCookie );

  // TODO: Take out debug statements when done.
  winston.debug( `website cookie = ${websiteCookie}` );
  winston.debug( `rosetta cookie = ${rosettaCookie}` );

  if ( userIsLoggedIn ) {
    if ( rosettaSessionIsFresh ) {
      winston.debug( 'Rosetta cookie is defined and it matches the website cookie.' );
      next();
    }
    else if ( rosettaSessionIsStale ) {
      winston.debug( 'Rosetta cookie is defined, but it doesn\'t match the website cookie.' );
      handleStaleRosettaSession( request, response );
    }
    else if ( userIsTranslatorOrTeamMember ) {
      winston.debug( 'User is a translator or a team member, but they didn\'t have a Rosetta cookie defined.' );
      createRosettaSession( request, websiteCookie, websiteUserData );
    }
    else {
      winston.debug( 'User has requested Rosetta access, but they are not a translator or team member.'
                     + 'Telling them to ask phethelp@gmail.com for access.' );
      denyRosettaAccess( response );
    }
  }
  else {
    winston.debug( 'User is not logged in. Sending them to the login page.' );
    sendUserToLoginPage( response, request.get( 'host' ), request.url );
  }
}

module.exports = ensureValidSession;