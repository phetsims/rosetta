// Copyright 2015-2019, University of Colorado Boulder

/**
 * Handler functions for ExpressJS-style routes that exist in the PhET translation utility.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

'use strict';

// node modules
const _ = require( 'underscore' ); // eslint-disable-line
const https = require( 'https' );
const fetch = require( 'node-fetch' ); // eslint-disable-line
const winston = require( 'winston' );
const { Pool } = require( 'pg' ); // eslint-disable-line

// server modules
const localeInfo = require( './localeInfo' );
const RosettaConstants = require( './RosettaConstants' );
const ServerTests = require( './ServerTests' );
const simData = require( './simData' );
const stringSubmissionQueue = require( './stringSubmissionQueue' ).stringSubmissionQueue; // eslint-disable-line
const TranslationUtils = require( './TranslationUtils' );
const escapeHTML = TranslationUtils.escapeHTML;
const renderError = TranslationUtils.renderError;

// constants
const GITHUB_RAW_FILE_URL_BASE = RosettaConstants.GITHUB_RAW_FILE_URL_BASE;
const TITLE = 'PhET Translation Utility (HTML5)';
const ASCII_REGEX = /^[ -~]+$/;
const STRING_VAR_IN_HTML_FILES = 'window.phet.chipper.strings';

// utility function for sending the user to the login page
function sendUserToLoginPage( res, host, destinationUrl ) {

  res.render( 'login-required.html', {
    title: 'Login Required',
    host: host,
    destinationUrl: destinationUrl
  } );
}

// utility function that returns the string if printable or a warning message if not
function getPrintableString( string ) {
  return ASCII_REGEX.test( string ) ? string : '(string contains non-printable characters)';
}

/**
 * Route that checks whether the user has a valid session in progress. This works by looking for the cookie set when
 * the user logs in to the main web site and, if said cookie is present, uses it to obtain user information from the
 * 'main' web site. This check is run on every page, but if the user has already been confirmed as a trusted
 * translator from the main site, it is just a single if statement instead of a call to the main web site.
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.checkForValidSession = function( req, res, next ) {

  if ( req.get( 'host' ).indexOf( 'localhost' ) === 0 ) {

    // the app is running on localhost, so session validation is bypassed
    winston.warn( 'Bypassing session validation to allow testing on localhost' );

    // set up fake session data
    req.session.teamMember = true;
    req.session.trustedTranslator = true;
    req.session.userId = 0;
    req.session.username = 'localhost-user';
    req.session.email = 'none';
    req.session.translatedStrings = {}; // for storing string history across submissions
    req.session.jSessionId = req.cookies.JSESSIONID; // to verify user is still logged in
    req.session.cookie.expires = null;

    // send to next route
    next();
    return;
  }

  // check whether the session cookie exists
  winston.info( 'Checking for login cookie' );
  const cookie = req.cookies.JSESSIONID;

  if ( cookie === undefined ) {

    // no session cookie present, the user must log in
    winston.info( 'session cookie not found, sending to login page' );
    winston.info( 'host = ' + req.get( 'host' ) );
    winston.info( 'req.url = ' + req.url );
    sendUserToLoginPage( res, req.get( 'host' ), req.url );
  }
  else if ( req.session.jSessionId && req.session.jSessionId !== cookie ) {

    // the user's session has expired, clear it and go to login page
    winston.info( 'session expired, forcing user to log in again' );

    req.session.destroy( function() {
      renderError( res,
        '<h1>Your session has expired</h1>' +
        '<p>Go to <a href="https://phet.colorado.edu/translate/">https://phet.colorado.edu/translate/</a> to start a new session.</p>',
        '' );
    } );
  }
  else if ( req.session.trustedTranslator || req.session.teamMember ) {

    // The session already has trustedTranslator defined, and it is true, so the user must be a trusted translator who
    // has already logged in.
    next();
  }
  else {

    // session cookie was present
    winston.info( 'valid session cookie existed, userID = ' + req.session.userId );

    // attempt to obtain session information
    const options = {
      host: req.get( 'host' ),
      path: '/services/check-login',
      method: 'GET',
      headers: {
        'Cookie': 'JSESSIONID=' + cookie
      }
    };

    const sessionDataRequestCallback = function( response ) {
      let data = '';

      // another chunk of data has been received, so append it
      response.on( 'data', function( chunk ) {
        data += chunk;
      } );

      // the whole response has been received - see if the credentials are valid
      response.on( 'end', function() {
        winston.info( 'data received: ' + data );
        let userData;
        try {
          userData = JSON.parse( data );
        }
        catch( error ) {

          // this happens sometimes, not sure why, see https://github.com/phetsims/rosetta/issues/188
          winston.error( 'error parsing user data, error = ' + error );
          userData = null;
        }
        if ( userData && userData.loggedIn ) {
          winston.info( 'credentials obtained, user is logged in, moving to next step' );

          if ( !userData.trustedTranslator && !userData.teamMember ) {
            renderError( res, 'You must be a trusted translator to use the PhET translation utility. ' +
                              'Email phethelp@colorado.edu for more information.', '' );
          }
          else {
            req.session.teamMember = userData.teamMember;
            req.session.trustedTranslator = userData.trustedTranslator;
            req.session.userId = userData.userId;
            req.session.username = userData.username;
            req.session.email = userData.email;
            req.session.translatedStrings = {}; // for storing string history across submissions
            req.session.jSessionId = cookie; // to verify user is still logged in
            req.session.cookie.expires = null; // browser session

            winston.info( 'updating user id to ' + req.session.userId );

            next(); // send to next route
          }
        }
        else {

          // user is not logged in, send them to the login page
          sendUserToLoginPage( res, req.get( 'host' ), req.url );
        }
      } );
    };

    const requestCredentials = https.request( options, sessionDataRequestCallback );

    // error handling
    requestCredentials.on( 'error', function( err ) {
      winston.error( 'error retrieving session data: ' + err );
      renderError( res, 'Unable to obtain user credentials', err );
    } );

    // send the request
    requestCredentials.end();
  }
};

module.exports.logout = function( req, res ) {

  req.session.destroy( function() {
    res.clearCookie( 'JSESSIONID' );
    res.redirect( '/' );
  } );
};

/**
 * route handler that lets the user choose a simulation and language to translate, and subsequently routes them to the
 * translation page
 * @param req
 * @param res
 */
module.exports.chooseSimulationAndLanguage = async function( req, res ) {

  const simInfoArray = await simData.getSimTranslationPageInfo( req.session.teamMember );

  // sort the list of sims to be in alphabetical order by sim title
  simInfoArray.sort( function( a, b ) {
    if ( a.simTitle < b.simTitle ) {
      return -1;
    }
    else if ( a.simTitle > b.simTitle ) {
      return 1;
    }
    return 0;
  } );

  res.render( 'translate-home.html', {
    title: TITLE,
    simInfoArray: simInfoArray,
    localeInfoArray: await localeInfo.getSortedLocaleInfoArray(),
    username: req.session.email || 'not logged in'
  } );
};

/**
 * A route that creates a page for translating a given simulation to a given language.  The simulation ID and the target
 * language are extracted from the incoming request.
 * @param req
 * @param res
 * @public
 */
module.exports.renderTranslationPage = async function( req, res ) {

  const pool = new Pool();
  const simName = req.params.simName;
  const targetLocale = req.params.targetLocale;
  const activeSimsPath = '/phetsims/perennial/master/data/active-sims';
  const userId = ( req.session.userId ) ? req.session.userId : 0; // use an id of 0 for localhost testing

  winston.info( 'creating translation page for sim = ' + simName + ', locale = ' + targetLocale );

  // get the URL of the live sim
  const simUrl = await simData.getLiveSimUrl( simName );
  winston.debug( 'sending request to ' + simUrl );

  // get the HTML file that represents the sim
  const simFetchResponse = await fetch( simUrl );

  if ( simFetchResponse.error || simFetchResponse.status !== 200 ) {
    winston.error( 'failed to retrieve live sim, error = ' + simFetchResponse.error );
    res.send( 'Error: Sim data not found' );
    return; // bail
  }

  const simHtml = await simFetchResponse.text();
  let i;
  let sims; // array of all active sims

  winston.debug( 'request from ' + simUrl + ' returned successfully' );

  // extract the translatable string keys from the sim's html file
  const extractedStringKeySets = TranslationUtils.extractStringKeys( simHtml );

  if ( !extractedStringKeySets ) {
    renderError( res, 'Tried to extract strings from an invalid URL', 'url: ' + simUrl );
    return;
  }

  // get the SHA of this sim
  const simSha = TranslationUtils.extractSimSha( simHtml, simName );
  winston.debug( 'sim sha: ' + simSha );

  const englishStrings = {}; // object to hold the English strings
  const fileRetrievalPromises = [];

  // initialize the sims array from the active-sims file in chipper
  winston.debug( 'sending request to ' + GITHUB_RAW_FILE_URL_BASE + activeSimsPath );
  const response = await fetch( GITHUB_RAW_FILE_URL_BASE + activeSimsPath );

  fileRetrievalPromises.push( response.text().then( body => {
      sims = body.toString().split( '\n' );
    } )
  );

  // create a request to retrieve each of the needed English string files
  extractedStringKeySets.forEach( function( extractedStringKeysObject ) {
    const projectName = extractedStringKeysObject.projectName;
    const repoSha = ( projectName === simName ) ? simSha : 'master';
    const stringsFilePath = GITHUB_RAW_FILE_URL_BASE + '/phetsims/' + projectName + '/' + repoSha + '/' + projectName +
                            '-strings_en.json';
    const translatedStringsPath = GITHUB_RAW_FILE_URL_BASE + '/phetsims/babel/' + global.config.babelBranch + '/' +
                                  projectName + '/' + projectName + '-strings_' + targetLocale + '.json';

    // request the english strings from GitHub
    fileRetrievalPromises.push( TranslationUtils.getGhStrings( stringsFilePath, englishStrings, projectName, true ) );

    // request the already existing translated strings from GitHub, which may or may not exist
    req.session.translatedStrings[ targetLocale ] = req.session.translatedStrings[ targetLocale ] || {};
    fileRetrievalPromises.push( TranslationUtils.getGhStrings(
      translatedStringsPath,
      req.session.translatedStrings[ targetLocale ],
      projectName,
      false
    ) );
  } );

  // wait until all files have been retrieved before moving to the next step
  await Promise.all( fileRetrievalPromises );

  winston.info( 'files needed for rendering the translation page retrieved from GitHub' );

  const currentSimStringsArray = [];
  const simStringsArray = [];
  const commonStringsArray = [];
  const unusedTranslatedStringsArray = [];

  // The user may have previously saved uncommitted strings and, if so, they are stored in a postgres database.  Start
  // checking for this by initializing an empty object with this information.
  // TODO: There should by a simple call to get the saved strings, and the code should be in a separate file.
  let repositories = '';
  const savedStrings = {};
  _.times( extractedStringKeySets.length, i => {
    if ( i > 0 ) {
      repositories += ' OR ';
    }
    repositories += 'repository = \'' + extractedStringKeySets[ i ].projectName + '\'';

    // Initialize saved strings for every repo to an empty object. These objects will store string key/value pairs for
    // each repo.
    savedStrings[ extractedStringKeySets[ i ].projectName ] = {};
  } );

  // create a parameterized query string for retrieving the user's previously saved strings
  const savedStringsQuery = 'SELECT * FROM saved_translations WHERE user_id = $1 AND locale = $2 AND (' + repositories + ')';

  // connect to the database and query for saved strings corresponding to this user and sim
  let rows = null;
  try {
    winston.info( 'retrieving any previously-saved-but-not-submitted strings, query template = ' + savedStringsQuery );
    try {

      // execute the query using the template query string and parameters for user ID and target locale
      const queryResponse = await pool.query( savedStringsQuery, [ userId, targetLocale ] );
      rows = queryResponse.rows;
      winston.info( 'retrieval of strings succeeded' );
    }
    catch( err ) {
      winston.error( 'retrieval of strings failed, err = ' + err );
    }
  }
  catch( err ) {
    winston.error( 'unable to retrieve saved strings from database, err = ' + err );
  }

  // load saved strings from database to saveStrings object if there are any
  if ( rows && rows.length > 0 ) {
    winston.info( 'using ' + rows.length + ' saved strings' );
    for ( i = 0; i < rows.length; i++ ) {
      const row = rows[ i ];
      savedStrings[ row.repository ][ row.stringkey ] = row.stringvalue;
    }
  }

  let simTitle; // sim title gets filled in here (e.g. Area Builder instead of area-builder)
  const otherSims = []; // other sim dependencies get filled in here (e.g. beers-law-lab when translating concentration)

  // iterate over all projects from which this sim draws strings
  _.times( extractedStringKeySets.length, i => {
    const project = extractedStringKeySets[ i ];
    const strings = englishStrings[ project.projectName ];
    const previouslyTranslatedStrings = req.session.translatedStrings[ targetLocale ][ project.projectName ];

    // compile and organize the string information as needed so that it can be presented to the user
    let array;
    if ( project.projectName === simName ) {
      simTitle = strings[ project.projectName + '.title' ] && strings[ project.projectName + '.title' ].value;
      array = currentSimStringsArray;
    }
    else if ( _.includes( sims, project.projectName ) ) {
      otherSims.push( project.projectName );
      array = simStringsArray;
    }
    else {
      array = commonStringsArray;
    }

    for ( let j = 0; j < project.stringKeys.length; j++ ) {
      const key = project.stringKeys[ j ];

      const stringVisible = strings.hasOwnProperty( key ) &&
                            ( ( strings[ key ].visible === undefined ) ? true : strings[ key ].visible );
      if ( stringVisible ) {

        // data needed to render to the string on the page - the key, the current value, the English value, and the repo
        const stringRenderInfo = {
          key: key,
          englishValue: escapeHTML( strings[ key ].value ),
          repo: project.projectName
        };

        const savedStringValue = savedStrings[ project.projectName ][ key ];

        // use saved string if it exists
        if ( savedStringValue ) {

          // log info about the retrieved string
          winston.debug( 'using saved string ' + key + ': ' + getPrintableString( savedStringValue ) );

          // set the retrieved value
          stringRenderInfo.value = escapeHTML( savedStringValue );
        }
        else if ( previouslyTranslatedStrings[ key ] ) {

          // use previous translation value obtained from GitHub, if it exists
          const translatedString = previouslyTranslatedStrings[ key ];
          winston.debug( 'using previously translated string ' + key + ': ' +
                         getPrintableString( translatedString.value ) );
          stringRenderInfo.value = escapeHTML( translatedString.value );
        }
        else {

          // there is no saved or previously translated string
          winston.debug( 'no saved or previously translated values found for string key ' + key );
          stringRenderInfo.value = '';
        }

        array.push( stringRenderInfo );
      }
      else {
        winston.debug( 'String key ' + project.stringKeys[ j ] + ' not found or not visible' );
      }
    }

    // Identify strings that are translated but not used so that they don't get removed from the translation. This is
    // only relevant for shared/common strings.
    for ( const stringKey in previouslyTranslatedStrings ) {
      if ( previouslyTranslatedStrings.hasOwnProperty( stringKey ) ) {
        let containsObjectWithKey = false;
        for ( let index = 0; index < array.length; index++ ) {
          if ( array[ index ].key === stringKey ) {
            containsObjectWithKey = true;
            break;
          }
        }
        if ( !containsObjectWithKey ) {
          winston.debug( 'repo: ' + project.projectName + ' key: ' + stringKey + ', ' +
                         '- translation exists, but unused in this sim, adding to pass-through data' );
          unusedTranslatedStringsArray.push( {
            repo: project.projectName,
            key: stringKey,
            value: previouslyTranslatedStrings[ stringKey ].value
          } );
        }
      }
    }
  } );

  // sort the arrays by the English values
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

  // get the locale-specific information needed to render the translation page
  const localeInfoObject = await localeInfo.getLocaleInfoObject();
  const targetLocaleInfo = localeInfoObject[ targetLocale ];
  const languageName = targetLocaleInfo ? targetLocaleInfo.name : 'Nonexistent locale';
  const languageDirection = targetLocaleInfo ? targetLocaleInfo.direction : 'ltr';

  // assemble the data that will be supplied to the template
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
    username: req.session.email || 'not logged in',
    trustedTranslator: ( req.session.trustedTranslator ) ? req.session.trustedTranslator : false
  };

  // render the translation page
  res.render( 'translate-sim.html', templateData );
};

/**
 * Route for submitting strings (when the user presses the "Submit" button on a translate sim page). The translation is
 * added to a queue of translations to be committed to github. Logic for this is in the file stringSubmissionQueue.js.
 * @param req
 * @param res
 */
module.exports.submitStrings = function( req, res ) {

  const simName = req.params.simName;
  const targetLocale = req.params.targetLocale;

  winston.info( 'queuing string submission for ' + simName + '_' + targetLocale );
  stringSubmissionQueue( req, res )
    .then( () => {
      winston.info( 'finished string submission for ' + simName + '_' + targetLocale );
    } );
};

/**
 * Route for testing a translation by replacing strings in the currently published simulation with those provided in the
 * request.  This does not save the strings.  This method opens a new tab in which the translated simulation will
 * appear.
 * @param {Object} req
 * @param {Object} res
 */
module.exports.testStrings = function( req, res ) {

  const simName = req.params.simName;

  winston.info( 'test-of-strings request received for sim ' + simName );

  TranslationUtils.getLatestSimHtml( simName )
    .then( simHtml => {

      // get the string definitions from the HTML file
      const re = new RegExp( STRING_VAR_IN_HTML_FILES + '.*$', 'm' );
      const extractedStrings = simHtml.match( re );
      const extractedStringsJson = extractedStrings[ 0 ]
        .replace( STRING_VAR_IN_HTML_FILES + ' = ', '' )
        .replace( /;$/m, '' );
      const stringsObject = JSON.parse( extractedStringsJson );

      // replace values in the extracted strings with those specified by the user
      const translatedStringsObject = req.body;
      _.keys( translatedStringsObject ).forEach( key => {
        if ( stringsObject.en[ key ] ) {
          stringsObject.en[ key ] = translatedStringsObject[ key ];
        }
        else {
          winston.error( 'key missing in extracted strings, key = ' + key );
        }
      } );
      const translatedStrings = STRING_VAR_IN_HTML_FILES + ' = ' + JSON.stringify( stringsObject ) + ';';

      // insert the changed strings into the sim HTML
      simHtml = simHtml.replace( re, translatedStrings );

      winston.info( 'successfully replaced strings in published sim with submissions from user, returning result' );

      // return the modified sim HTML as the response to the request
      res.send( simHtml );
    } )
    .catch( err => renderError( res, 'Error testing translation...', err ) );
};

/**
 * Route handler for saving strings to the short-term storage area (when the user presses the "Save" button on the
 * translate sim page). Strings are added to the postgres database, and NOT to the GitHub long term storage area.
 * @param req
 * @param res
 */
module.exports.saveStrings = async function( req, res ) {

  winston.debug( 'saveStrings called' );
  const simName = req.params.simName;
  const targetLocale = req.params.targetLocale;
  const userId = ( req.session.userId ) ? req.session.userId : 0;
  const pool = new Pool();
  const repos = {};
  let error = false;

  // loop through the string descriptions in the post request, saving each one
  for ( const stringDescription in req.body ) {

    if ( !Object.hasOwnProperty.call( req.body, stringDescription ) ) {
      continue;
    }

    // string descriptions should be in the form "[repository] [key]", for example "area-builder area-builder.title"
    const repoAndKey = stringDescription.split( ' ' );
    const repo = repoAndKey[ 0 ];
    const key = repoAndKey[ 1 ];
    const stringValue = req.body[ stringDescription ];

    // if this repo hasn't been encountered yet, add it to our repos object
    if ( !repos[ repo ] ) {
      repos[ repo ] = {};
    }

    const timestamp = new Date();

    if ( key && stringValue && stringValue.length > 0 ) {
      try {

        // execute the query that will save the string to the DB
        await pool.query(
          'SELECT upsert_saved_translations' +
          '($1::bigint, $2::varchar(255), $3::varchar(255), $4::varchar(8), $5::varchar(255), $6::timestamp)',
          [ userId, key, repo, targetLocale, stringValue, timestamp ]
        );
        winston.info( 'successfully saved strings to DB' );
      }
      catch( err ) {
        winston.error( 'error saving string values to DB, aborting save operation, err = ' + err );
        error = true;
        break;
      }
    }
  }

  if ( !error ) {
    winston.info( 'finished string saving for ' + simName + '_' + targetLocale );
  }

  // send the response
  res.json( {
    'success': !error
  } );
};

/**
 * Route used when translation utility is off line.
 *
 * @param req
 * @param res
 */
module.exports.showOffLinePage = function( req, res ) {
  winston.warn( 'Showing the \'Off Line\' page to the user' );
  res.render( 'offline.html', { title: 'Off Line' } );
};

/**
 * Default route for when a page is not found in the translation utility.
 *
 * @param req
 * @param res
 */
function pageNotFound( req, res ) {
  res.send( '<p>Error: Page not found.  URL = ' + req.url + '</p>' );
}

module.exports.pageNotFound = pageNotFound;

/**
 * displays the main test harness page if the user is a PhET team member, used for development
 *
 * @param req
 * @param res
 */
module.exports.test = function( req, res ) {

  // only logged in PhET team members can access the test page
  if ( req.session.teamMember ) {
    winston.info( 'test page accessed' );
    res.render( 'test.html', { title: 'Test' } );
  }
  else {
    pageNotFound( req, res );
  }
};

/**
 * Handle a request to run a test.
 * for team members only
 * @param req
 * @param res
 */
module.exports.runTest = async function( req, res ) {

  // only logged in PhET team members can run tests
  if ( req.session.teamMember ) {

    const testID = req.params.testID;
    const result = await ServerTests.executeTest( testID );

    // send back an empty response
    res.send( result );
  }
  else {

    // the user is not a team member, render the "not found" page
    pageNotFound( req, res );
  }
};

/**
 * Handle a request to run all rosetta server side tests.
 * for team members only
 * @param req
 * @param res
 */
module.exports.runTests = async function( req, res ) {

  // only logged in PhET team members can run tests
  if ( req.session.teamMember ) {

    const result = await ServerTests.runTests();

    res.send( result );
  }
  else {

    // the user is not a team member, render the "not found" page
    pageNotFound( req, res );
  }
};
