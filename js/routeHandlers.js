// Copyright 2015-2021, University of Colorado Boulder

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
const axios = require( 'axios' );
const winston = require( 'winston' );
const { Pool } = require( 'pg' ); // eslint-disable-line

// server modules
const localeInfo = require( './localeInfo' );
const longTermStringStorage = require( './longTermStringStorage' );
const RosettaConstants = require( './RosettaConstants' );
const simData = require( './simData' );
const stringSubmissionQueue = require( './stringSubmissionQueue' ).stringSubmissionQueue; // eslint-disable-line
const TranslationUtils = require( './TranslationUtils' );
const escapeHtml = TranslationUtils.escapeHtml;
const renderErrorPage = require( './renderErrorPage' );
const requestBuild = require( './requestBuild' );

// constants
const GITHUB_RAW_FILE_URL_BASE = RosettaConstants.GITHUB_RAW_FILE_URL_BASE;
const TITLE = 'PhET Translation Utility (HTML5)';
const ASCII_REGEX = /^[ -~]+$/;
const STRING_VAR_IN_HTML_FILES = RosettaConstants.STRING_VAR_IN_HTML_FILES;

//===========================================================================//
// Utility functions below.                                                  //
//===========================================================================//

// Returns string if printable. Otherwise returns warning message.
function getPrintableString( string ) {
  return ASCII_REGEX.test( string ) ? string : '(String contains non-printable characters.)';
}

//===========================================================================//
// Routes below.                                                             //
//===========================================================================//

/**
 * Route that logs the user out and redirects them to the home page.
 *
 * @param request
 * @param response
 * @param next
 */
module.exports.logout = function( request, response ) {
  request.session.destroy( () => {
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
  simInfoArray.sort( ( a, b ) => {
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

  let simHtml = '';
  try {
    const simHtmlResponse = await axios.get( simUrl );
    simHtml = simHtmlResponse.data;
    winston.debug( 'Successfully retrieved sim HTML.' );
  }
  catch( error ) {
    const errorMessage = `Unable to get sim HTML for ${simName}. ${error.message}`;
    winston.error( errorMessage );
    throw new Error( errorMessage );
  }

  winston.debug( `Request for ${simUrl} returned successfully.` );

  // Extract the translatable string keys from the sim's HTML file.
  const extractedStringKeysMap = TranslationUtils.extractStringKeys( simHtml );

  if ( extractedStringKeysMap.size === 0 ) {
    renderErrorPage( response, `Unable to retrieve string keys from ${simUrl}.`, '' );
    return;
  }

  // Get the SHA of this sim.
  const simSha = TranslationUtils.extractSimSha( simHtml, simName );
  winston.debug( `Sim SHA: ${simSha}.` );

  // Initialize the sims array from the active-sims file in the phetsims/chipper repository.
  winston.debug( `Sending request to ${GITHUB_RAW_FILE_URL_BASE}${activeSimsPath}.` );
  let activeSimsFileContents = '';
  try {
    const activeSimsFileFetchResponse = await axios.get( GITHUB_RAW_FILE_URL_BASE + activeSimsPath );
    activeSimsFileContents = activeSimsFileFetchResponse.data;
    winston.debug( 'Got active sims.' );
  }
  catch( error ) {
    const errorMessage = `Unable to get active sims file for ${simName}. ${error.message}`;
    winston.error( errorMessage );
    throw new Error( errorMessage );
  }
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
    repositories += `repository = '${projectName}'`;

    // Initialize saved strings for every repo to an empty object. These objects will store string key/value pairs for
    // each repo.
    savedStrings[ projectName ] = {};
  }

  // Create a parameterized query string for retrieving the user's previously saved strings.
  const savedStringsQuery = `SELECT * FROM saved_translations WHERE user_id = $1 AND locale = $2 AND (${repositories})`;

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
      simTitle = strings[ `${projectName}.title` ] && strings[ `${projectName}.title` ].value;
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
          winston.debug( `Using previously translated string ${stringKey}: ${
            getPrintableString( translatedString.value )}` );
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
          winston.debug( `repo: ${projectName} key: ${previouslyTranslatedStringKey}, ` +
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

  winston.info( `queuing string submission for ${simName}_${targetLocale}` );
  stringSubmissionQueue( request, response )
    .then( () => {
      winston.info( `finished string submission for ${simName}_${targetLocale}` );
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
      const re = new RegExp( `${STRING_VAR_IN_HTML_FILES}.*$`, 'm' );
      const extractedStrings = simHtml.match( re );
      const extractedStringsJson = extractedStrings[ 0 ]
        .replace( `${STRING_VAR_IN_HTML_FILES} = `, '' )
        .replace( /;$/m, '' );
      const stringsObject = JSON.parse( extractedStringsJson );

      // Replace values in the extracted strings with those specified by the user.
      const translatedStringsObject = request.body;
      _.keys( translatedStringsObject ).forEach( key => {

        // If a translator inserts \n, we want a newline. See https://github.com/phetsims/rosetta/issues/207#issuecomment-764986950.
        if ( translatedStringsObject[ key ].indexOf( '\\n' ) !== -1 ) {
          winston.info( 'Making sure translator\'s newline works.' );
          translatedStringsObject[ key ] = translatedStringsObject[ key ].replace( /\\n/g, '\n' );
        }

        if ( stringsObject.en[ key ] ) {
          stringsObject.en[ key ] = translatedStringsObject[ key ];
        }
        else {
          winston.error( `Key missing in extracted strings. Key: ${key}.` );
        }
      } );
      const translatedStrings = `${STRING_VAR_IN_HTML_FILES} = ${JSON.stringify( stringsObject )};`;

      // Insert the changed strings into the sim HTML.
      simHtml = simHtml.replace( re, translatedStrings );

      winston.info( 'Successfully replaced strings in published sim with submissions from user. Returning result.' );

      // Return the modified sim HTML as the response to the request.
      response.send( simHtml );
    } )
    .catch( error => renderErrorPage( response, 'Error testing translation...', error ) );
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
    success: !saveError
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
  response.render( 'offline.html', { title: 'Offline' } );
};

/**
 * Default route for when a page is not found in the translation utility.
 *
 * @param request
 * @param response
 */
function pageNotFound( request, response ) {
  response.send( `<p>Error: Page not found.  URL = ${request.url}</p>` );
}

module.exports.pageNotFound = pageNotFound;

/**
 * Helper function. !isNaN is confusing, hence this function.
 *
 * @param stringToTest
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
        renderErrorPage( response, message, errorDetails );
        return;
      }
    }
    else {
      const message = 'Invalid simulation name.';
      const errorDetails = 'Sim name is not a string.';
      renderErrorPage( response, message, errorDetails );
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
        renderErrorPage( response, message, errorDetails );
        return;
      }
    }
    else {
      const message = 'Invalid locale.';
      const errorDetails = 'Locale is not a string.';
      renderErrorPage( response, message, errorDetails );
      return;
    }

    // Extract the user ID from the request.
    let userIdToSend = null;
    if ( isStringNumber( request.params.userId ) ) {

      // Set up URL for the Babel string file and get the string file object.
      const STRING_FILE_URL = `${GITHUB_RAW_FILE_URL_BASE}/phetsims/babel/master/${simName}/${simName}-strings_${targetLocale}.json`;
      let stringFileObject = {};
      try {
        stringFileObject = await axios.get( STRING_FILE_URL );
        stringFileObject = stringFileObject.data;
        winston.debug( 'Got string file.' );
      }
      catch( error ) {
        const message = `Unable to get string file from Babel. ${error.message}`;
        winston.error( message );
        const errorDetails = `Here's where you're trying to get the string file: ${STRING_FILE_URL}. Check this and make sure it's correct.`;
        renderErrorPage( response, message, errorDetails );
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
        renderErrorPage( response, message, errorDetails );
        return;
      }
    }
    else {
      const message = 'Invalid user ID.';
      const errorDetails = '!isNaN( userIdToSend ) (checks if your user ID is a number) returned false.';
      renderErrorPage( response, message, errorDetails );
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
      const message = `Build for ${simLocaleAndId} unsuccessful.`;
      const errorDetails = `${error.message}`;
      renderErrorPage( response, message, errorDetails );

    }
  }
  else {

    // The user is not a team member; render the not found page.
    pageNotFound( request, response );
  }
};

/**
 * Given repo-style (lowercase kebab) sim name, returns a Map.<{String,String[]}>. This Map's keys are repo names, and
 * its values are arrays of string keys. The repos are the repos where the sim gets its string keys. This Map maps
 * repos to arrays of string keys. That is, it contains all string keys for a given simulation.
 *
 * @param {string} simName - repo-style sim name
 * @returns {Promise<Map.<{String,String[]}>>} - Map of repos to string key arrays
 */
async function getEnglishStringKeysMap( simName ) {

  // Get the published sim's HTML.
  const simUrl = await simData.getLiveSimUrl( simName );
  let simHtml = '';
  try {
    const simHtmlResponse = await axios.get( simUrl );
    simHtml = simHtmlResponse.data;
    winston.debug( 'Successfully retrieved sim HTML.' );
  }
  catch( error ) {
    const errorMessage = `Unable to get sim HTML for ${simName}. ${error.message}`;
    winston.error( errorMessage );
    throw new Error( errorMessage );
  }

  // Return a Map of the sim's string keys.
  return TranslationUtils.extractStringKeys( simHtml );
}

/**
 * Given repo-style (lowercase kebab) sim name, returns a Map.<{String,String[]}>. This Map's keys are repo names, and
 * its values are arrays of string keys. The repos are the repos where the sim gets its string keys. This Map maps
 * repos to arrays of translated string keys. If none of the strings in a given repo have been translated, there will
 * still be a repo in the Map, but the string key array for that repo will be empty.
 *
 * @param {string} simName - repo-style sim name
 * @param {string} targetLocale - the language code for the locale, e.g. "de" for German
 * @returns {Promise<Map.<{String,String[]}>>} - Map of repos to string key arrays
 */
async function getTranslatedStringKeysMap( simName, targetLocale ) {

  // {Map.<{String,String[]}>} - a Map with repo names and an array of string keys for that repo
  const englishStringKeysMap = await getEnglishStringKeysMap( simName );
  const translatedStringKeysMap = new Map();

  // For each repo in the English Map, add untranslated string keys.
  for ( const [ repo ] of englishStringKeysMap ) {

    // Get translated string keys for the repo.
    const translatedStringsObject = await longTermStringStorage.getTranslatedStrings( repo, targetLocale );
    const translatedStringKeys = Object.keys( translatedStringsObject );

    // Add the repo name and the translated string keys to the Map.
    translatedStringKeysMap.set( repo, translatedStringKeys );
  }

  return translatedStringKeysMap;
}

/**
 * Given repo-style (lowercase kebab) sim name, returns a Map.<{String,String[]}>. This Map's keys are repo names, and
 * its values are arrays of string keys. The repos are the repos where the sim gets its string keys. This Map maps
 * repos to arrays of untranslated string keys. If there are no untranslated strings for a given repo, that repo will
 * still be in the Map, but its string key array will be empty.
 *
 * @param {string} simName - repo-style sim name
 * @param {string} targetLocale - the language code for the locale, e.g. "de" for German
 * @returns {Promise<Map.<{String,String[]}>>} - Map of repos to string key arrays
 */
async function getUntranslatedStringKeysMap( simName, targetLocale ) {

  // {Map.<{String,String[]}>} - a Map with repo names and an array of string keys for that repo
  const englishStringKeysMap = await getEnglishStringKeysMap( simName );
  const untranslatedStringKeysMap = new Map();

  // Get translated string keys for comparison.
  const translatedStringKeysMap = await getTranslatedStringKeysMap( simName, targetLocale );

  // Iterate through each repo and check if there are untranslated string keys.
  for ( const [ repo, stringKeyArray ] of englishStringKeysMap ) {

    // Iterate through the string key array associated with a repo.
    for ( const stringKey of stringKeyArray ) {

      // If the repo isn't in the Map, add it.
      if ( !untranslatedStringKeysMap.has( repo ) ) {
        untranslatedStringKeysMap.set( repo, [] );
      }

      // If there any string keys in the English array that aren't in the translated array, add them to the
      // untranslated array.
      if ( !translatedStringKeysMap.get( repo ).includes( stringKey ) ) {
        untranslatedStringKeysMap.get( repo ).push( stringKey );
      }
    }
  }

  return untranslatedStringKeysMap;
}

/**
 * Makes a string of HTML for a report on which string keys are untranslated for a given simulation.
 *
 * @param {string} simName - repo-style sim name
 * @param {string} targetLocale - the language code for the locale, e.g. "de" for German
 * @returns {Promise<string>} - a string of HTML to display to the user
 */
async function getSimStringReportHtml( simName, targetLocale ) {

  // Get the untranslated strings for display.
  const untranslatedStringKeysMap = await getUntranslatedStringKeysMap( simName, targetLocale );

  // Tell user about sim, locale.
  let html = `<h2>Report for ${simName} in locale ${targetLocale}:</h2>`;

  // Tell user about untranslated string keys for each repo.
  for ( const [ repo, stringKeyArray ] of untranslatedStringKeysMap ) {
    html += `<h3>Untranslated string keys in the ${repo} repository:</h3>`;
    html += '<ul>';
    if ( stringKeyArray.length === 0 ) {
      html += `<li>All string keys have been translated in the ${repo} repository! :)</li>`;
    }
    else {
      for ( const stringKey of stringKeyArray ) {
        html += `<li>${stringKey}</li>`;
      }
    }
    html += '</ul>';
  }

  return html;
}

/**
 * Displays a report to the user about a sim's untranslated strings. It tells the user what the untranslated string
 * keys are in each repo for a given sim.
 *
 * @param {Object} request
 * @param {Object} response
 * @returns {Promise<string>} - a string of HTML to display to the user
 */
module.exports.simStringReport = async function( request, response ) {
  response.send( await getSimStringReportHtml( request.params.simName, request.params.targetLocale ) );
};

/**
 * Makes a string of HTML for a report on which string keys are untranslated for a given locale.
 *
 * @param targetLocale - the language code for the locale, e.g. "de" for German
 * @returns {Promise<string>} - a string of HTML to display to the user
 */
async function getLocaleStringReportHtml( targetLocale ) {

  // Get a list of the HTML5 sims that are available on the PhET website.
  const listOfSimNames = await simData.getListOfSimNames( false );

  // Tell user about locale.
  let html = `<h1>Report for locale ${targetLocale}:</h1>`;

  // Get a sim string report for each sim.
  for ( const sim of listOfSimNames ) {
    html += await getSimStringReportHtml( sim, targetLocale );
  }

  return html;
}

/**
 * Displays a report to the user about a sim's untranslated strings. It tells the user what the untranslated string
 * keys are in each repo for a given sim.
 *
 * @param {Object} request
 * @param {Object} response
 * @returns {Promise<string>} - a string of HTML to display to the user
 */
module.exports.localeStringReport = async function( request, response ) {
  response.send( await getLocaleStringReportHtml( request.params.targetLocale ) );
};
