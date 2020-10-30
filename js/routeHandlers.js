// Copyright 2015-2020, University of Colorado Boulder

/**
 * Handler functions for Express.js-style routes that exist in the PhET translation utility.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Liam Mulhall
 */

'use strict';

// Node modules
const _ = require( 'lodash' ); // eslint-disable-line
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const https = require( 'https' );
const longTermStringStorage = require( './longTermStringStorage' );
const winston = require( 'winston' );
const { Pool } = require( 'pg' ); // eslint-disable-line

// server modules
const getJsonObject = require( './getJsonObject' );
const localeInfo = require( './localeInfo' );
const RosettaConstants = require( './RosettaConstants' );
const ServerTests = require( './ServerTests' );
const simData = require( './simData' );
const stringSubmissionQueue = require( './stringSubmissionQueue' ).stringSubmissionQueue; // eslint-disable-line
const TranslationUtils = require( './TranslationUtils' );
const escapeHtml = TranslationUtils.escapeHtml;
const renderError = TranslationUtils.renderError;
const requestBuild = require( './requestBuild' );

// constants
const GITHUB_RAW_FILE_URL_BASE = RosettaConstants.GITHUB_RAW_FILE_URL_BASE;
const TITLE = 'PhET Translation Utility (HTML5)';
const ASCII_REGEX = /^[ -~]+$/;
const STRING_VAR_IN_HTML_FILES = RosettaConstants.STRING_VAR_IN_HTML_FILES;

//===========================================================================//
// Utility functions below.                                                  //
//===========================================================================//

// Sends user to login page.
function sendUserToLoginPage( response, host, destinationUrl ) {
  response.render( 'login-required.html', {
    title: 'Login Required',
    host: host,
    destinationUrl: destinationUrl
  } );
}

// Returns string if printable. Otherwise returns warning message.
function getPrintableString( string ) {
  return ASCII_REGEX.test( string ) ? string : '(String contains non-printable characters.)';
}

//===========================================================================//
// Routes below.                                                             //
//===========================================================================//

/**
 * Route that checks whether the user has a valid session in progress. This works by looking for the cookie set when
 * the user logs in to the main website and, if said cookie is present, uses it to obtain user information from the
 * 'main' website. This check is run on every page, but if the user has already been confirmed as a trusted
 * translator from the main website, it is just a single if statement instead of a call to the main website.
 *
 * @param request
 * @param response
 * @param next
 */
module.exports.checkForValidSession = function( request, response, next ) {

  if ( request.get( 'host' ).indexOf( 'localhost' ) === 0 ) {

    // The app is running on localhost, so session validation is bypassed.
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

    // We're done. Send to next route.
    next();
    return;
  }

  // Check whether session cookie exists.
  winston.info( 'Checking for login cookie.' );
  const cookie = request.cookies.JSESSIONID;

  if ( cookie === undefined ) {

    // No session cookie present; user must log in.
    winston.info( 'Session cookie not found. Sending user to login page.' );
    winston.info( `Host is ${request.get( 'host' )}.` );
    winston.info( `Request URL is ${request.url}.` );
    sendUserToLoginPage( response, request.get( 'host' ), request.url );
  }
  else if ( request.session.jSessionId && request.session.jSessionId !== cookie ) {

    // User's session has expired. Clear session and send user to login page.
    winston.info( 'Session expired. Forcing user to log in again.' );

    request.session.destroy( function() {
      renderError( response,
        '<h1>Your session has expired</h1>' +
        '<p>Go to <a href="https://phet.colorado.edu/translate/">https://phet.colorado.edu/translate/</a> to start a new session.</p>',
        '' );
    } );
  }
  else if ( request.session.trustedTranslator || request.session.teamMember ) {

    // If the session has "trustedTranslator" or "teamMember" true, then we have a valid session.
    next();
  }
  else {

    // Session cookie was present.
    winston.info( `Valid session cookie exists. User ID is ${request.session.userId}.` );

    // Attempt to obtain session information.
    const options = {
      host: request.get( 'host' ),
      path: '/services/check-login',
      method: 'GET',
      headers: {
        'Cookie': 'JSESSIONID=' + cookie
      }
    };

    const sessionDataRequestCallback = function( response ) {
      let data = '';

      // Another chunk of data has been received, so append it.
      response.on( 'data', function( chunk ) {
        data += chunk;
      } );

      // The whole response has been received. See if credentials are valid.
      response.on( 'end', function() {
        winston.info( `Data: ${data}.` );
        let userData;
        try {
          userData = JSON.parse( data );
        }
        catch( error ) {

          // This happens sometimes. Not sure why. See https://github.com/phetsims/rosetta/issues/188.
          winston.error( `Error parsing user data. Error: ${error}.` );
          userData = null;
        }
        if ( userData && userData.loggedIn ) {
          winston.info( 'Credentials obtained. User is logged in. Moving to next step.' );

          if ( !userData.trustedTranslator && !userData.teamMember ) {
            renderError( response, 'You must be a trusted translator to use the PhET translation utility. ' +
                                   'Email phethelp@colorado.edu for more information.', '' );
          }
          else {
            request.session.teamMember = userData.teamMember;
            request.session.trustedTranslator = userData.trustedTranslator;
            request.session.userId = userData.userId;
            request.session.username = userData.username;
            request.session.email = userData.email;
            request.session.translatedStrings = {}; // For storing string history across submissions.
            request.session.jSessionId = cookie; // To verify user is still logged in.
            request.session.cookie.expires = null; // Browser session.

            winston.info( `Updating user id to ${request.session.userId}.` );

            // Send to next route.
            next();
          }
        }
        else {

          // User is not logged in. Send them to the login page.
          sendUserToLoginPage( response, request.get( 'host' ), request.url );
        }
      } );
    };

    const requestCredentials = https.request( options, sessionDataRequestCallback );

    // Handle errors.
    requestCredentials.on( 'error', function( error ) {
      winston.error( `Unable to receive session data. Error: ${error}.` );
      renderError( response, `Unable to obtain user credentials. Error: ${error}.` );
    } );

    // Send the request.
    requestCredentials.end();
  }
};

/**
 * Route that logs the user out and redirects them to the home page.
 *
 * @param request
 * @param response
 * @param next
 */
module.exports.logout = function( request, response ) {
  request.session.destroy( function() {
    response.clearCookie( 'JSESSIONID' );
    response.redirect( '/' );
  } );
};

/**
 * Route handler that lets the user choose a simulation and language to translate, and subsequently routes them to the
 * translation page.
 *
 * @param request
 * @param response
 */
module.exports.chooseSimulationAndLanguage = async function( request, response ) {

  const simInfoArray = await simData.getSimTranslationPageInfo( request.session.teamMember );

  // Sort the list of sims in alphabetical order by sim title.
  simInfoArray.sort( function( a, b ) {
    if ( a.simTitle < b.simTitle ) {
      return -1;
    }
    else if ( a.simTitle > b.simTitle ) {
      return 1;
    }
    return 0;
  } );

  response.render( 'translate-home.html', {
    title: TITLE,
    simInfoArray: simInfoArray,
    localeInfoArray: await localeInfo.getSortedLocaleInfoArray(),
    username: request.session.email || 'not logged in'
  } );
};

/**
 * A route that creates a page for translating a given simulation to a given language. The simulation ID and the target
 * language are extracted from the incoming request.
 *
 * @param request
 * @param response
 * @public
 */
module.exports.renderTranslationPage = async function( request, response ) {

  const simName = request.params.simName;
  const targetLocale = request.params.targetLocale;
  const activeSimsPath = '/phetsims/perennial/master/data/active-sims';
  const userId = ( request.session.userId ) ? request.session.userId : 0; // Use an ID of 0 for localhost testing.

  winston.info( `Creating translation page for ${simName} in ${targetLocale}.` );

  // Get the URL of the live sim.
  const simUrl = await simData.getLiveSimUrl( simName );
  winston.debug( `Sending request to ${simUrl}.` );

  // Get the HTML file that represents the sim.
  const simFetchResponse = await nodeFetch( simUrl );

  if ( simFetchResponse.error || simFetchResponse.status !== 200 ) {
    winston.error( `Failed to retrieve live sim. Error: ${simFetchResponse.error}.` );

    // This will display a simple error page to the user.
    response.send( 'Error: Sim data not found.' );
    return;
  }

  // Extract the HTML for the sim.
  const simHtml = await simFetchResponse.text();

  winston.debug( `Request for ${simUrl} returned successfully.` );

  // Extract the translatable string keys from the sim's HTML file.
  const extractedStringKeysMap = TranslationUtils.extractStringKeys( simHtml );

  if ( extractedStringKeysMap.size === 0 ) {
    renderError( response, `Unable to retrieve string keys from ${simUrl}.`, '' );
    return;
  }

  // Get the SHA of this sim.
  const simSha = TranslationUtils.extractSimSha( simHtml, simName );
  winston.debug( `Sim SHA: ${simSha}.` );

  // Initialize the sims array from the active-sims file in the phetsims/chipper repository.
  winston.debug( 'Sending request to ' + GITHUB_RAW_FILE_URL_BASE + activeSimsPath + '.' );
  const activeSimsFileFetchResponse = await nodeFetch( GITHUB_RAW_FILE_URL_BASE + activeSimsPath );
  const activeSimsFileContents = await activeSimsFileFetchResponse.text();
  const activeSims = activeSimsFileContents.toString().split( '\n' );

  const englishStrings = {};
  request.session.translatedStrings[ targetLocale ] = request.session.translatedStrings[ targetLocale ] || {};

  // Retrieve all English and translated strings for this sim from long-term storage.
  for ( const projectName of extractedStringKeysMap.keys() ) {

    // Get the English strings.
    englishStrings[ projectName ] = await longTermStringStorage.getEnglishStrings(
      projectName,
      ( projectName === simName ) ? simSha : 'master'
    );

    // Get previously translated strings for the target locale.
    request.session.translatedStrings[ targetLocale ][ projectName ] =
      await longTermStringStorage.getTranslatedStrings( projectName, targetLocale );
  }

  winston.info( 'Files needed for rendering the translation page retrieved from long term storage.' );

  const currentSimStringsArray = [];
  const simStringsArray = [];
  const commonStringsArray = [];
  const unusedTranslatedStringsArray = [];

  // The user may have previously saved uncommitted strings and, if so, they are stored in a postgres database. Start
  // checking for this by initializing an empty object with this information.
  // TODO: Create a separate file that contains code to get the saved strings. Then simply call that code here. See https://github.com/phetsims/rosetta/issues/190#issuecomment-682169944.
  const pool = new Pool( {
    connectionTimeoutMillis: RosettaConstants.DATABASE_QUERY_TIMEOUT
  } );
  let repositories = '';
  const savedStrings = {};

  for ( const projectName of extractedStringKeysMap.keys() ) {
    if ( repositories.length > 0 ) {
      repositories += ' OR ';
    }
    repositories += 'repository = \'' + projectName + '\'';

    // Initialize saved strings for every repo to an empty object. These objects will store string key/value pairs for
    // each repo.
    savedStrings[ projectName ] = {};
  }

  // Create a parameterized query string for retrieving the user's previously saved strings.
  const savedStringsQuery = 'SELECT * FROM saved_translations WHERE user_id = $1 AND locale = $2 AND (' + repositories + ')';

  // Connect to the database and query for saved strings corresponding to this user and sim.
  let rows = null;
  try {
    winston.info( `Retrieving any previously-saved-but-not-submitted strings. Query: ${savedStringsQuery}.` );
    try {

      // Execute the query using the template query string and parameters for user ID and target locale.
      const queryResponse = await pool.query( savedStringsQuery, [ userId, targetLocale ] );
      rows = queryResponse.rows;
      winston.info( 'Retrieval of previously-saved-but-not-submitted strings succeeded.' );
    }
    catch( error ) {
      winston.error( `Retrieval of previously-saved-but-not-submitted strings failed. Error: ${error}.` );
    }
  }
  catch( error ) {
    winston.error( `Unable to retrieve saved strings from database. Error: ${error}.` );
  }

  // Load saved strings from database to "savedStrings" object if there are any.
  if ( rows && rows.length > 0 ) {
    winston.info( `Using ${rows.length} saved strings.` );
    for ( let i = 0; i < rows.length; i++ ) {
      const row = rows[ i ];
      savedStrings[ row.repository ][ row.stringkey ] = row.stringvalue;
    }
  }

  // Sim title gets filled in here (For example, "Area Builder" instead of "area-builder".)
  let simTitle;

  // Other sim dependencies get filled in here. (For example, "beers-law-lab" when translating Concentration.)
  const otherSims = [];

  // Iterate over all projects from which this sim draws strings and start organizing the strings into the format
  // needed by the HTML template that will present the strings to the user.
  for ( const projectName of extractedStringKeysMap.keys() ) {
    const strings = englishStrings[ projectName ];
    const previouslyTranslatedStrings = request.session.translatedStrings[ targetLocale ][ projectName ];

    // Put the strings into different arrays depending on whether they are from the sim, a shared sim, or common code.
    let array;
    if ( projectName === simName ) {
      simTitle = strings[ projectName + '.title' ] && strings[ projectName + '.title' ].value;
      array = currentSimStringsArray;
    }
    else if ( _.includes( activeSims, projectName ) ) {

      // If this is another sim an not a common code repo, it is presented to the user somewhat differently.
      otherSims.push( projectName );
      array = simStringsArray;
    }
    else {
      array = commonStringsArray;
    }

    // Loop through the strings, deciding whether they should be presented to the user and, if so, set up the
    // appropriate information for the HTML template.
    extractedStringKeysMap.get( projectName ).forEach( stringKey => {

      // If this is an accessibility (a11y) string, skip it so that it is not presented to the user. The translation of
      // accessibility strings will be supported someday, just not quite yes. Please see
      // https://github.com/phetsims/rosetta/issues/214 for more information.
      if ( stringKey.indexOf( 'a11y.' ) === 0 ) {
        winston.info( 'Intentionally skipping accessibility string. (It will not be presented to the user.)' );
        winston.info( `String Key: ${stringKey}.` );
        return;
      }

      const stringVisible = strings.hasOwnProperty( stringKey ) &&
                            ( ( strings[ stringKey ].visible === undefined ) ? true : strings[ stringKey ].visible );
      if ( stringVisible ) {

        // Data needed to render to the string on the page: the key, the current value, the English value, and the repo.
        const stringRenderInfo = {
          key: stringKey,
          englishValue: escapeHtml( strings[ stringKey ].value ),
          repo: projectName
        };

        const savedStringValue = savedStrings[ projectName ][ stringKey ];

        // Use saved string if it exists.
        if ( savedStringValue ) {

          // Log info about the retrieved string.
          winston.debug( `Using saved string ${stringKey}: ${getPrintableString( savedStringValue )}.` );

          // Set the retrieved value.
          stringRenderInfo.value = escapeHtml( savedStringValue );
        }
        else if ( previouslyTranslatedStrings[ stringKey ] ) {

          // Use previous translation value obtained from GitHub, if it exists.
          const translatedString = previouslyTranslatedStrings[ stringKey ];
          winston.debug( 'Using previously translated string ' + stringKey + ': ' +
                         getPrintableString( translatedString.value ) );
          stringRenderInfo.value = escapeHtml( translatedString.value );
        }
        else {

          // There is no saved or previously translated string.
          winston.debug( `No saved or previously translated values found for string key ${stringKey}.` );
          stringRenderInfo.value = '';
        }

        array.push( stringRenderInfo );
      }
      else {
        winston.debug( `String key ${stringKey} not found or not visible.` );
      }
    } );

    // Identify strings that are translated but not used so that they don't get removed from the translation. This is
    // only relevant for shared/common strings.
    for ( const previouslyTranslatedStringKey in previouslyTranslatedStrings ) {
      if ( previouslyTranslatedStrings.hasOwnProperty( previouslyTranslatedStringKey ) ) {
        let containsObjectWithKey = false;
        for ( let index = 0; index < array.length; index++ ) {
          if ( array[ index ].key === previouslyTranslatedStringKey ) {
            containsObjectWithKey = true;
            break;
          }
        }
        if ( !containsObjectWithKey ) {
          winston.debug( 'repo: ' + projectName + ' key: ' + previouslyTranslatedStringKey + ', ' +
                         '- translation exists, but unused in this sim, adding to pass-through data.' );
          unusedTranslatedStringsArray.push( {
            repo: projectName,
            key: previouslyTranslatedStringKey,
            value: previouslyTranslatedStrings[ previouslyTranslatedStringKey ].value
          } );
        }
      }
    }
  }

  // Sort the arrays by the English values.
  const compare = function( a, b ) {
    if ( a.englishValue.toLowerCase() < b.englishValue.toLowerCase() ) {
      return -1;
    }
    else if ( a.englishValue.toLowerCase() > b.englishValue.toLowerCase() ) {
      return 1;
    }
    return 0;
  };
  simStringsArray.sort( compare );
  commonStringsArray.sort( compare );

  // Get the locale-specific information needed to render the translation page.
  const localeInfoObject = await localeInfo.getLocaleInfoObject();
  const targetLocaleInfo = localeInfoObject[ targetLocale ];
  const languageName = targetLocaleInfo ? targetLocaleInfo.name : 'Nonexistent locale';
  const languageDirection = targetLocaleInfo ? targetLocaleInfo.direction : 'ltr';

  // Assemble the data that will be supplied to the template.
  const templateData = {
    title: TITLE,
    subtitle: 'Please enter a translation for each English string:',
    destinationLanguage: languageName,
    currentSimStringsArray: currentSimStringsArray,
    simStringsArray: simStringsArray,
    commonStringsArray: commonStringsArray,
    unusedTranslatedStringsArray: unusedTranslatedStringsArray,
    simName: simName,
    simTitle: simTitle ? simTitle : simName,
    otherSimNames: otherSims.join( ', ' ),
    localeName: targetLocale,
    direction: languageDirection,
    simUrl: await simData.getLiveSimUrl( simName ),
    username: request.session.email || 'not logged in',
    trustedTranslator: ( request.session.trustedTranslator ) ? request.session.trustedTranslator : false
  };

  // Render the translation page.
  response.render( 'translate-sim.html', templateData );
};

/**
 * Route for submitting strings (when the user presses the "Submit" button on a translate sim page). The translation is
 * added to a queue of translations to be committed to GitHub. Logic for this is in the file stringSubmissionQueue.js.
 *
 * @param request
 * @param response
 */
module.exports.submitStrings = function( request, response ) {

  const simName = request.params.simName;
  const targetLocale = request.params.targetLocale;

  winston.info( 'queuing string submission for ' + simName + '_' + targetLocale );
  stringSubmissionQueue( request, response )
    .then( () => {
      winston.info( 'finished string submission for ' + simName + '_' + targetLocale );
    } );
};

/**
 * Route for testing a translation by replacing strings in the currently published simulation with those provided in the
 * request. This does not save the strings. This method opens a new tab in which the translated simulation will appear.
 *
 * @param {Object} request
 * @param {Object} response
 */
module.exports.testStrings = function( request, response ) {

  const simName = request.params.simName;

  winston.info( `test-of-strings request received for ${simName}.` );

  TranslationUtils.getLatestSimHtml( simName )
    .then( simHtml => {

      // Get the string definitions from the HTML file.
      const re = new RegExp( STRING_VAR_IN_HTML_FILES + '.*$', 'm' );
      const extractedStrings = simHtml.match( re );
      const extractedStringsJson = extractedStrings[ 0 ]
        .replace( STRING_VAR_IN_HTML_FILES + ' = ', '' )
        .replace( /;$/m, '' );
      const stringsObject = JSON.parse( extractedStringsJson );

      // Replace values in the extracted strings with those specified by the user.
      const translatedStringsObject = request.body;
      _.keys( translatedStringsObject ).forEach( key => {
        if ( stringsObject.en[ key ] ) {
          stringsObject.en[ key ] = translatedStringsObject[ key ];
        }
        else {
          winston.error( `Key missing in extracted strings. Key: ${key}.` );
        }
      } );
      const translatedStrings = STRING_VAR_IN_HTML_FILES + ' = ' + JSON.stringify( stringsObject ) + ';';

      // Insert the changed strings into the sim HTML.
      simHtml = simHtml.replace( re, translatedStrings );

      winston.info( 'Successfully replaced strings in published sim with submissions from user. Returning result.' );

      // Return the modified sim HTML as the response to the request.
      response.send( simHtml );
    } )
    .catch( error => renderError( response, 'Error testing translation...', error ) );
};

/**
 * Route handler for saving strings to the short-term storage area (when the user presses the "Save" button on the
 * translate sim page). Strings are added to the postgres database, and not to the GitHub long-term storage area.
 *
 * @param request
 * @param response
 */
module.exports.saveStrings = async function( request, response ) {

  winston.debug( 'saveStrings called.' );
  const simName = request.params.simName;
  const targetLocale = request.params.targetLocale;
  const userId = ( request.session.userId ) ? request.session.userId : 0;
  const pool = new Pool( {
    connectionTimeoutMillis: RosettaConstants.DATABASE_QUERY_TIMEOUT
  } );
  const repos = {};
  let saveError = false;

  // Loop through the string descriptions in the post request, saving each one.
  for ( const stringDescription in request.body ) {

    if ( !Object.hasOwnProperty.call( request.body, stringDescription ) ) {
      continue;
    }

    // String descriptions should be in the form "[repository] [key]", for example "area-builder area-builder.title".
    const repoAndKey = stringDescription.split( ' ' );
    const repo = repoAndKey[ 0 ];
    const key = repoAndKey[ 1 ];
    const stringValue = request.body[ stringDescription ];

    // If this repo hasn't been encountered yet, add it to our repos object.
    if ( !repos[ repo ] ) {
      repos[ repo ] = {};
    }

    const timestamp = new Date();

    if ( key && stringValue && stringValue.length > 0 ) {
      try {

        // Execute the query that will save the string to the DB.
        await pool.query(
          'SELECT upsert_saved_translations' +
          '($1::bigint, $2::varchar(255), $3::varchar(255), $4::varchar(8), $5::varchar(255), $6::timestamp)',
          [ userId, key, repo, targetLocale, stringValue, timestamp ]
        );
        winston.info( 'Successfully saved strings to DB.' );
      }
      catch( error ) {
        winston.error( `Error saving string values to DB. Aborting save operation. Error: ${error}.` );
        saveError = true;
        break;
      }
    }
  }

  if ( !saveError ) {
    winston.info( `Finished string saving for ${simName}_${targetLocale}.` );
  }

  // Send the response.
  response.json( {
    'success': !saveError
  } );
};

/**
 * Route used when translation utility is offline.
 *
 * @param request
 * @param response
 */
module.exports.showOfflinePage = function( request, response ) {
  winston.warn( 'Showing the \'Offline\' page to the user.' );
  response.render( 'offline.html', { title: 'Off Line' } );
};

/**
 * Default route for when a page is not found in the translation utility.
 *
 * @param request
 * @param response
 */
function pageNotFound( request, response ) {
  response.send( '<p>Error: Page not found.  URL = ' + request.url + '</p>' );
}

module.exports.pageNotFound = pageNotFound;

/**
 * Route for rendering the error page.
 *
 * @param request
 * @param response
 */
function renderErrorPage( request, response, message, errorDetails ) {
  response.render( 'error.html', {
    title: 'Translation Utility Error',
    message: message,
    errorDetails: errorDetails,
    timestamp: new Date().getTime()
  } );
}

module.exports.renderErrorPage = renderErrorPage;

/**
 * Helper function. !isNaN is confusing, hence this function.
 *
 * @param string
 * @returns {boolean}
 */
function isStringNumber( stringToTest ) {
  if ( typeof stringToTest === 'string' ) {
    return !isNaN( stringToTest );
  }
  else {
    winston.error( `isStringNumber was called with parameter type ${typeof stringToTest}. Returning false.` );
    return false;
  }
}

/**
 * Handle a request to trigger a build. For team members only.
 *
 * @param request
 * @param response
 */
module.exports.triggerBuild = async function( request, response ) {

  // Only a logged-in PhET team member can trigger a build through this route.
  if ( request.session.teamMember ) {

    // Get list of sim names so that we can validate our simName parameter.
    const arrayOfSimNames = await simData.getListOfSimNames( false );

    // Get list of locale info.
    const localeInfoObjectArray = await localeInfo.getSortedLocaleInfoArray();

    // Put locales in a new array so that we can validate our targetLocale parameter.
    const localeArray = localeInfoObjectArray.map( localeInfo => localeInfo.code );

    // Extract the sim name from the request.
    let simName = '';
    if ( typeof request.params.simName === 'string' ) {
      if ( arrayOfSimNames.includes( request.params.simName ) ) {
        winston.info( 'simName is valid.' );
        simName = request.params.simName;
      }
      else {
        const message = 'Invalid simulation name.';
        const errorDetails = 'Sim name not found in array made with simData.getListOfSimNames.';
        renderErrorPage( request, response, message, errorDetails );
        return;
      }
    }
    else {
      const message = 'Invalid simulation name.';
      const errorDetails = 'Sim name is not a string.';
      renderErrorPage( request, response, message, errorDetails );
      return;
    }

    // Extract the target locale from the request.
    let targetLocale = '';
    if ( typeof request.params.targetLocale === 'string' ) {
      if ( localeArray.includes( request.params.targetLocale ) ) {
        winston.info( 'targetLocale is valid.' );
        targetLocale = request.params.targetLocale;
      }
      else {
        const message = 'Invalid locale.';
        const errorDetails = 'Locale not found in array made with localeInfo.getSortedLocaleInfoArray.';
        renderErrorPage( request, response, message, errorDetails );
        return;
      }
    }
    else {
      const message = 'Invalid locale.';
      const errorDetails = 'Locale is not a string.';
      renderErrorPage( request, response, message, errorDetails );
      return;
    }

    // Extract the user ID from the request.
    let userIdToSend = null;
    if ( isStringNumber( request.params.userId ) ) {

      // Set up URL for the Babel string file and get the string file object.
      const STRING_FILE_URL = `${GITHUB_RAW_FILE_URL_BASE}/phetsims/babel/master/${simName}/${simName}-strings_${targetLocale}.json`;
      let stringFileObject = {};
      try {
        stringFileObject = await getJsonObject( STRING_FILE_URL, {}, /^text\/plain/ );
      }
      catch( error ) {
        const errorMessage = `Unable to get string file from Babel. ${error.message}`;
        winston.error( errorMessage );
        const errorDetails = `Here's where you're trying to get the string file: ${STRING_FILE_URL}. Check this and make sure it's correct.`;
        renderErrorPage( request, response, errorMessage, errorDetails );
        return;
      }
      winston.info( 'String file object successfully retrieved.' );

      // Create an empty array of user ID's that will be populated with user ID's from the Babel string file for the
      // translation.
      const arrayOfUserIds = [];

      // For each translatable string in the file, create a copy of the string object and extract a copy of that string
      // object's history object.
      for ( const stringProperty in stringFileObject ) {
        const stringObject = stringFileObject[ stringProperty ];
        const { history } = stringObject;

        // For each history entry, create a history object and add its user ID to the array of user ID's if the user ID
        // is not already in the array.
        for ( const historyEntry in history ) {
          const historyObject = history[ historyEntry ];
          const userId = historyObject.userId;
          if ( !arrayOfUserIds.includes( userId ) ) {
            arrayOfUserIds.push( userId );
          }
        }
      }

      // Log the supplied user ID and the ones found in the Babel string file.
      winston.debug( `request.params.userId: ${request.params.userId}` );
      winston.debug( `arrayOfUserIds: ${arrayOfUserIds}` );

      // If the supplied user ID exists in the array of user ID's, set the userId variable.
      // It is important to remember that request.params.userId is a string. We must cast it to an integer.
      // The elements of the arrayOfUserIds, on the other hand, should be numbers.
      if ( arrayOfUserIds.includes( parseInt( request.params.userId, 10 ) ) ) {
        winston.info( 'Supplied user ID is valid.' );
        userIdToSend = request.params.userId;
      }
      else {
        winston.info( 'User ID was not found in the Babel string file.' );
        const message = 'Invalid user ID.';
        const errorDetails = 'request.params.userId did not match a user ID in the string file fetched from Babel.';
        renderErrorPage( request, response, message, errorDetails );
        return;
      }
    }
    else {
      const message = 'Invalid user ID.';
      const errorDetails = '!isNaN( userIdToSend ) (checks if your user ID is a number) returned false.';
      renderErrorPage( request, response, message, errorDetails );
      return;
    }

    // Log message about triggerBuild being called.
    const simLocaleAndId = `sim: ${simName}, locale: ${targetLocale}, ID: ${userIdToSend}`;
    winston.info( `triggerBuild called for ${simLocaleAndId}.` );

    // Try to send the build request. If it's successful, tell the user. Otherwise handle the error and put up the page
    // not found page.
    try {
      const buildRequestWasSent = await requestBuild( simName, targetLocale, userIdToSend );
      winston.debug( `requestBuild was called and returned ${buildRequestWasSent}.` );
      if ( buildRequestWasSent ) {
        response.send( `Successfully triggered build for ${simLocaleAndId}.` );
      }
    }
    catch( error ) {
      winston.error( `Build for ${simLocaleAndId} unsuccessful. ${error.message}` );
      winston.warn( 'If you\'re trying to trigger a build, you should set sendBuildRequests = true in your config file.' );
      const errorMessage = `Build for ${simLocaleAndId} unsuccessful.`;
      const errorDetails = `${error.message}`;
      renderErrorPage( request, response, errorMessage, errorDetails );
      return;
    }
  }
  else {

    // The user is not a team member; render the not found page.
    pageNotFound( request, response );
  }
};

/**
 * Displays the main test harness page if the user is a PhET team member. Used for development.
 *
 * @param request
 * @param response
 */
module.exports.displayTestPage = function( request, response ) {

  // Only logged in PhET team members can access the test page.
  if ( request.session.teamMember ) {
    winston.info( 'Test page accessed.' );
    response.render( 'test.html', { title: 'Test' } );
  }
  else {
    pageNotFound( request, response );
  }
};

/**
 * Handle a request to run a test. For team members only.
 *
 * @param request
 * @param response
 */
module.exports.runSpecificTest = async function( request, response ) {

  // Only logged in PhET team members can run tests.
  if ( request.session.teamMember ) {

    const testID = request.params.testID;
    const result = await ServerTests.executeTest( testID );

    // Send back an empty response.
    response.send( result );
  }
  else {

    // The user is not a team member; render the "not found" page.
    pageNotFound( request, response );
  }
};

/**
 * Handle a request to run all rosetta server side tests. For team members only.
 *
 * @param request
 * @param response
 */
module.exports.runAllTests = async function( request, response ) {

  // Only logged in PhET team members can run tests.
  if ( request.session.teamMember ) {

    const result = await ServerTests.runTests();

    response.send( result );
  }
  else {

    // The user is not a team member; render the "not found" page.
    pageNotFound( request, response );
  }
};