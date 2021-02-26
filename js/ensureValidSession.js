// Copyright 2020, University of Colorado Boulder

/**
 * We ensure the user has logged in as a translator or a team member recently. If their Rosetta session is stale, we
 * prompt them to log in again. If they aren't a translator or team member, we prompt them to request access to
 * Rosetta. If the user is running Rosetta on localhost, we create a fake Rosetta session.
 *
 * @author Liam Mulhall
 */

// modules
const axios = require( 'axios' );
const renderErrorPage = require( './renderErrorPage' );
const sendUserToLoginPage = require( './sendUserToLoginPage' );
const winston = require( 'winston' );

/**
 * If the user is on localhost, create a fake Rosetta session.
 *
 * @param request {Object} - The Express request object.
 */
function bypassSessionValidation( request ) {

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
}

/**
 * Use the website's /services/check-login to get the user's data. This includes username, userId, email, loggedIn,
 * teamMember, and trustedTranslator.
 *
 * @param request {Object} - The Express request object.
 * @param websiteCookie {string} - The cookie for the website.
 * @returns {Promise.<AxiosResponse.<Object>>} - The user's data.
 */
async function getUserData( request, websiteCookie ) {
  winston.debug( 'Getting user data from /services/check-login.' );
  const url = `https://${request.get( 'host' )}/services/check-login`;
  const options = {
    headers: {
      Cookie: `JSESSIONID=${websiteCookie}`
    }
  };
  try {
    return await axios.get( url, options );
  }
  catch( error ) {
    winston.error( `Unable to get website user data. ${error}` );
  }
}

/**
 * If the user's Rosetta cookie doesn't match the website cookie, i.e. their Rosetta session is stale, we destroy their
 * stale Rosetta session and prompt them to log in again. If they log in again, a fresh Rosetta session will be
 * created for the user.
 *
 * @param request {Object} - The Express request object.
 * @param response {Object} - The Express response object.
 */
function handleStaleRosettaSession( request, response ) {
  winston.debug( 'Rosetta session expired. Prompting user to log in.' );
  request.session.destroy( () => {
    const loginPageUrl = `https://${request.get( 'host' )}/en/sign-in?dest=${request.url}`;
    const message = '<h1>Your session has expired. Please log in again.</h1>'
                    + `<a href="${loginPageUrl}">Log in</a>`;
    const errorDetails = 'Login cookie is stale.';
    renderErrorPage( response, message, errorDetails );
  } );
}

/**
 * If the user is logged in but they don't have a Rosetta cookie, create a fresh Rosetta session. If the user has a
 * stale Rosetta session, the stale Rosetta session should be destroyed and this function will create a fresh Rosetta
 * session.
 *
 * @param request {Object} - The Express request object.
 * @param websiteCookie {string} - The cookie for the website.
 * @param websiteUserData {Object} - The user's data.
 */
function createRosettaSession( request, websiteCookie, websiteUserData ) {
  winston.debug( 'Creating fresh Rosetta session.' );
  request.session.cookie.expires = null; // Browser session.
  request.session.email = websiteUserData.email;
  request.session.jSessionId = websiteCookie;
  request.session.teamMember = websiteUserData.teamMember;
  request.session.translatedStrings = {}; // For storing string history across submissions.
  request.session.trustedTranslator = websiteUserData.trustedTranslator;
  request.session.userId = websiteUserData.userId;
  request.session.username = websiteUserData.username;
}

/**
 * If the user isn't a translator or a team member, we render the error page with a message about requesting access to
 * Rosetta.
 *
 * @param response {Object} - The Express response object.
 */
function denyRosettaAccess( response ) {
  winston.debug( 'Prompting user to request access to Rosetta.' );
  const message = '<h1>You must be a trusted translator or a team member to access this page.</h1>'
                  + '<p>Send an email to phethelp@gmail.com to request access.</p>';
  renderErrorPage( response, message, '' );
}

/**
 * If the user is logged in, we check to see if they have a fresh Rosetta session in progress or if they have stale
 * Rosetta session or if they need a Rosetta session created. If the user is logged in but they aren't a translator or
 * a team member, we render the error page with a message about requesting access to Rosetta. If the user isn't logged
 * in, we prompt them to log in.
 *
 * @param request {Object} - The Express request object.
 * @param response {Object} - The Express response object.
 * @param next {Function} - The Express next function.
 */
async function ensureValidSession( request, response, next ) {

  const userIsOnLocalhost = request.get( 'host' ).indexOf( 'localhost' ) === 0;
  if ( userIsOnLocalhost ) {
    bypassSessionValidation( request );
    return next();
  }

  const websiteCookie = request.cookies.JSESSIONID;
  winston.debug( 'Checking for website cookie.' );
  if ( websiteCookie ) {
    winston.debug( `Got website cookie: ${websiteCookie}. Getting website user data.` );
    let websiteUserData = await getUserData( request, websiteCookie );
    websiteUserData = websiteUserData.data;
    winston.debug( `Got website user data: ${JSON.stringify( websiteUserData, null, 2 )}` );
    winston.debug( 'Checking if user is logged in.' );
    if ( websiteUserData.loggedIn ) {
      winston.debug( `User is logged in: ${websiteUserData.loggedIn}. Ensuring valid session.` );
      const rosettaCookie = request.session.jSessionId;
      const rosettaSessionIsFresh = ( rosettaCookie !== undefined ) && ( rosettaCookie === websiteCookie );
      const rosettaSessionIsStale = ( rosettaCookie !== undefined ) && ( rosettaCookie !== websiteCookie );
      const userIsTranslatorOrTeamMember = websiteUserData.trustedTranslator || websiteUserData.teamMember;
      if ( rosettaSessionIsFresh ) {
        winston.debug( `Rosetta cookie is defined and it matches the website cookie: ${rosettaSessionIsFresh}. `
                       + 'Rosetta session is fresh.' );
        next();
      }
      else if ( rosettaSessionIsStale ) {
        winston.debug( `Rosetta cookie is defined, but it doesn't match the website cookie: ${rosettaSessionIsStale}. `
                       + 'Rosetta session is stale.' );
        handleStaleRosettaSession( request, response );
      }
      else if ( userIsTranslatorOrTeamMember ) {
        winston.debug( `User is a translator or a team member: ${userIsTranslatorOrTeamMember}. `
                       + `They didn't have a Rosetta cookie defined: ${rosettaCookie === undefined}.` );
        createRosettaSession( request, websiteCookie, websiteUserData );
        next();
      }
      else {
        winston.debug( `User has requested Rosetta access. They are not a translator or team member: ${!userIsTranslatorOrTeamMember}.` );
        denyRosettaAccess( response );
      }
    }
    else {
      winston.debug( `Sending user to login page. User is not logged in: ${websiteUserData.loggedIn}.` );
      sendUserToLoginPage( response, request.get( 'host' ), request.url );
    }
  }
  else {
    winston.debug( `Sending user to login page. The website cookie is: ${websiteCookie}.` );
    sendUserToLoginPage( response, request.get( 'host' ), request.url );
  }
}

module.exports = ensureValidSession;