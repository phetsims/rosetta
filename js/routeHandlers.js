// Copyright 2018, University of Colorado Boulder

/**
 * Handler functions for ExpressJS-style routes that exist in the PhET translation utility.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

/* eslint-env node */
'use strict';

// node modules
// const query = require( 'pg-query' ); // eslint-disable-line
const _ = require( 'underscore' ); // eslint-disable-line
const https = require( 'https' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const winston = require( 'winston' );
const { Client } = require( 'pg' ); // eslint-disable-line

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
    winston.log( 'warn', 'Bypassing session validation to allow testing on localhost' );

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
  winston.log( 'info', 'Checking for login cookie' );
  const cookie = req.cookies.JSESSIONID;

  if ( cookie === undefined ) {

    // no session cookie present, the user must log in
    winston.log( 'info', 'session cookie not found, sending to login page' );
    winston.log( 'info', 'host = ' + req.get( 'host' ) );
    winston.log( 'info', 'req.url = ' + req.url );
    sendUserToLoginPage( res, req.get( 'host' ), req.url );
  }
  else if ( req.session.jSessionId && req.session.jSessionId !== cookie ) {

    // the user's session has expired, clear it and go to login page
    winston.log( 'info', 'session expired, forcing user to log in again' );

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
    winston.log( 'info', 'valid session cookie existed, userID = ' + req.session.userId );

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
        winston.log( 'info', 'data received: ' + data );
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
          winston.log( 'info', 'credentials obtained, user is logged in, moving to next step' );

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

            winston.log( 'info', 'updating user id to ' + req.session.userId );

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
      winston.log( 'error', 'error retrieving session data: ' + err );
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

  let simInfoArray = await simData.getSimTranslationPageInfo( req.session.teamMember );

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

  const client = new Client();

  let simName = req.params.simName;
  let targetLocale = req.params.targetLocale;
  let activeSimsPath = '/phetsims/perennial/master/data/active-sims';
  let userId = ( req.session.userId ) ? req.session.userId : 0; // use an id of 0 for localhost testing

  winston.log( 'info', 'creating translation page for ' + simName + ' ' + targetLocale );

  // get the URL of the live sim
  const simUrl = await simData.getLiveSimUrl( simName );
  winston.log( 'info', 'sending request to ' + simUrl );

  // extract strings from the live sim's html file
  const UrlResponse = await nodeFetch( simUrl );

  if ( UrlResponse.error || UrlResponse.status !== 200 ) {
    winston.log( 'error', 'failed to retrieve live sim, error = ' + UrlResponse.error );
    res.send( 'Error: Sim data not found' );
    return;
  }

  const body = await UrlResponse.text();
  let i;
  let sims; // array of all active sims

  winston.log( 'info', 'request from ' + simUrl + ' returned successfully' );

  // extract strings from the sim's html file and store them in the extractedStrings array
  // extractedStrings in an array of objects of the form { projectName: 'color-vision', stringKeys: [ 'key1', 'key2', ... ] }
  let result = TranslationUtils.extractStrings( body, simName );

  if ( !result ) {
    renderError( res, 'Tried to extract strings from an invalid URL', 'url: ' + simUrl );
    return;
  }

  let extractedStrings = result.extractedStrings;
  let simSha = result.sha; // sha of the sim at the time of publication, or 'master' if no sha is found
  winston.log( 'info', 'sim sha: ' + simSha );

  let englishStrings = {}; // object to hold the English strings
  let stringPromises = [];

  // initialize the sims array from the active-sims file in chipper
  winston.log( 'info', 'sending request to ' + GITHUB_RAW_FILE_URL_BASE + activeSimsPath );
  const response = await nodeFetch( GITHUB_RAW_FILE_URL_BASE + activeSimsPath );

  stringPromises.push( response.text().then( ( body ) => {
      sims = body.toString().split( '\n' );
    } )
  );

  extractedStrings.forEach( async function( extractedStringObject ) {
    let projectName = extractedStringObject.projectName;
    let repoSha = ( projectName === simName ) ? simSha : 'master';
    let stringsFilePath = GITHUB_RAW_FILE_URL_BASE + '/phetsims/' + projectName + '/' + repoSha + '/' + projectName +
                          '-strings_en.json';
    let translatedStringsPath = GITHUB_RAW_FILE_URL_BASE + '/phetsims/babel/' + global.preferences.babelBranch + '/' +
                                projectName + '/' + projectName + '-strings_' + targetLocale + '.json';

    // request the english strings
    stringPromises.push( TranslationUtils.getGhStrings( stringsFilePath, englishStrings, projectName, true ) );

    // request the already existing translated strings, which may or may not exist
    req.session.translatedStrings[ targetLocale ] = req.session.translatedStrings[ targetLocale ] || {};
    stringPromises.push( TranslationUtils.getGhStrings(
      translatedStringsPath,
      req.session.translatedStrings[ targetLocale ],
      projectName,
      false
    ) );
  } );

  // wait until all string files have been retrieved before moving to the next step
  return Promise.all( stringPromises ).then( async results => {
    winston.log( 'info', 'finished called in renderTranslationPage' );

    let currentSimStringsArray = [];
    let simStringsArray = [];
    let commonStringsArray = [];
    let unusedTranslatedStringsArray = [];

    // create a query for determining if the user has any saved strings
    let repositories = '';
    let savedStrings = {};
    for ( i = 0; i < extractedStrings.length; i++ ) {
      if ( i > 0 ) {
        repositories += ' OR ';
      }
      repositories += 'repository = \'' + extractedStrings[ i ].projectName + '\'';

      // Initialize saved strings for every repo to an empty object.
      // These objects will store string key/value pairs for each repo.
      savedStrings[ extractedStrings[ i ].projectName ] = {};
    }
    let savedStringsQuery = 'SELECT * from saved_translations where user_id = $1 AND locale = $2 AND (' + repositories + ')';
    winston.log( 'info', 'running query: ' + savedStringsQuery );

    await client.connect();

    // query postgres to see if there are any saved strings for this user
    client.query( savedStringsQuery, [ userId, targetLocale ], async function( err, rows ) {
      winston.log( 'info', 'query returned' );
      if ( err ) {
        winston.log( 'error', 'query failed, error = ' + err );
        return;
      }

      // load saved strings from database to saveStrings object if there are any
      if ( rows && rows.length > 0 ) {
        winston.log( 'info', 'using ' + rows.length + ' saved strings' );
        for ( i = 0; i < rows.length; i++ ) {
          let row = rows[ i ];
          savedStrings[ row.repository ][ row.stringkey ] = row.stringvalue;
        }
      }

      client.end();

      let simTitle; // sim title gets filled in here (e.g. Area Builder instead of area-builder)
      let otherSims = []; // other sim dependencies get filled in here (e.g. beers-law-lab when translating concentration)

      // iterate over all projects from which this sim draws strings
      for ( i = 0; i < extractedStrings.length; i++ ) {
        let project = extractedStrings[ i ];
        let strings = englishStrings[ project.projectName ];
        let previouslyTranslatedStrings = req.session.translatedStrings[ targetLocale ][ project.projectName ];

        // put the strings under common strings, current sim strings, or sim strings depending on which project they are from
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
          let key = project.stringKeys[ j ];

          let stringVisible = strings.hasOwnProperty( key ) && ( ( strings[ key ].visible === undefined ) ? true : strings[ key ].visible );
          if ( stringVisible ) {

            // data needed to render to the string on the page - the key, the current value, the English value, and the repo
            let stringRenderInfo = {
              key: key,
              englishValue: escapeHTML( strings[ key ].value ),
              repo: project.projectName
            };

            let savedStringValue = savedStrings[ project.projectName ][ key ];

            // use saved string if it exists
            if ( savedStringValue ) {

              // log info about the retrieved string
              winston.log( 'info', 'using saved string ' + key + ': ' + getPrintableString( savedStringValue ) );

              // set the retrieved value
              stringRenderInfo.value = escapeHTML( savedStringValue );
            }
            else if ( previouslyTranslatedStrings[ key ] ) {

              // use previous translation value obtained from GitHub, if it exists
              let translatedString = previouslyTranslatedStrings[ key ];
              winston.log( 'info', 'using previously translated string ' + key + ': ' +
                                   getPrintableString( translatedString.value ) );
              stringRenderInfo.value = escapeHTML( translatedString.value );
            }
            else {

              // there is no saved or previously translated string
              winston.log( 'info', 'no saved or previously translated values found for string key ' + key );
              stringRenderInfo.value = '';
            }

            array.push( stringRenderInfo );
          }
          else {
            winston.log( 'info', 'String key ' + project.stringKeys[ j ] + ' not found or not visible' );
          }
        }

        // Identify strings that are translated but not used so that they don't get removed from the translation.
        // This is only relevant for shared/common strings.
        for ( let stringKey in previouslyTranslatedStrings ) {
          if ( previouslyTranslatedStrings.hasOwnProperty( stringKey ) ) {
            let containsObjectWithKey = false;
            for ( let index = 0; index < array.length; index++ ) {
              if ( array[ index ].key === stringKey ) {
                containsObjectWithKey = true;
                break;
              }
            }
            if ( !containsObjectWithKey ) {
              winston.log( 'info', 'repo: ' + project.projectName + ' key: ' + stringKey + ', ' +
                                   '- translation exists, but unused in this sim, adding to pass-through data' );
              unusedTranslatedStringsArray.push( {
                repo: project.projectName,
                key: stringKey,
                value: previouslyTranslatedStrings[ stringKey ].value
              } );
            }
          }
        }
      }

      // sort the arrays by the English values
      let compare = function( a, b ) {
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
      let templateData = {
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

      // Render the page.
      res.render( 'translate-sim.html', templateData );
    } );
  } );
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

  winston.log( 'info', 'queuing string submission for ' + simName + '_' + targetLocale );
  stringSubmissionQueue( req, res )
    .then(  () => {
      winston.log( 'info', 'finished string submission for ' + simName + '_' + targetLocale );
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

  winston.log( 'info', 'test-of-strings request received for sim ' + simName );

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
          winston( 'error', 'key missing in extracted strings, key = ' + key );
        }
      } );
      const translatedStrings = STRING_VAR_IN_HTML_FILES + ' = ' + JSON.stringify( stringsObject ) + ';';

      // insert the changed strings into the sim HTML
      simHtml = simHtml.replace( re, translatedStrings );

      winston.log( 'info', 'successfully replaced strings in published sim with submissions from user, returning result' );

      // return the modified sim HTML as the response to the request
      res.send( simHtml );
    } )
    .catch( err => renderError( res, 'Error testing translation...', err ) );
};

/**
 * Route for saving strings (when the user presses the "Save" button on the translate sim page).
 * Strings are added to the postgres database.
 * @param req
 * @param res
 */
module.exports.saveStrings = function( req, res ) {

  const simName = req.params.simName;
  const targetLocale = req.params.targetLocale;
  const userId = ( req.session.userId ) ? req.session.userId : 0;

  let error = false;

  const finished = _.after( Object.keys( req.body ).length, function() {
    winston.log( 'info', 'finished string saving for ' + simName + '_' + targetLocale );
    res.json( {
      'success': !error
    } );
  } );

  const repos = {};
  for ( let string in req.body ) {
    if ( Object.hasOwnProperty.call( req.body, string ) ) {

      // data submitted is in the form "[repository] [key]", for example "area-builder area-builder.title"
      const repoAndKey = string.split( ' ' );
      const repo = repoAndKey[ 0 ];
      const key = repoAndKey[ 1 ];

      if ( !repos[ repo ] ) {
        repos[ repo ] = {};
      }

      const stringValue = req.body[ string ];
      const ts = new Date();

      ( function( key, stringValue ) {
        const client = new Client();

        if ( key && stringValue && stringValue.length > 0 ) {
          client.query( 'SELECT upsert_saved_translations' +
                 '($1::bigint, $2::varchar(255), $3::varchar(255), $4::varchar(8), $5::varchar(255), $6::timestamp)',
                 [ userId, key, repo, targetLocale, stringValue, ts ],
            function( err, rows, result ) {
              if ( err ) {
                winston.log(
                  'error',
                  'inserting row: (' + userId + ', ' + key + ', ' + stringValue + ', ' + targetLocale + '), error = ' + err
                );
                error = true;
              }
              finished();
            } );
        }
        else {
          finished();
        }

      } )( key, stringValue );
    }
    else {
      finished();
    }
  }
};

/**
 * Route used when translation utility is off line.
 *
 * @param req
 * @param res
 */
module.exports.showOffLinePage = function( req, res ) {
  winston.log( 'warn', 'Showing the \'Off Line\' page to the user' );
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
    winston.log( 'info', 'test page accessed' );
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
    let result = await ServerTests.executeTest( testID );

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


/**
 * Route for extracting strings from a build sim, see TranslationUtils.extractStrings.
 */
module.exports.extractStringsAPI = TranslationUtils.extractStringsAPI;