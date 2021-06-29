// Copyright 2017-2021, University of Colorado Boulder

/**
 * This file defines a singleton object that is used for long-term storage of the translated strings. It is called
 * "long-term" to distinguish it from the short-term storage that can occur if a user decides to save an in-progress
 * translation without submitting it as a completed translation. Strings that are saved to long-term storage are used
 * when translated sims are built, whereas string saved to short term storage are not.
 *
 * This implementation uses GitHub as the "back end" where the strings are stored, but it is intended to have a fairly
 * generic API so that if we ever decide to use something else as the long-term storage medium for strings, this object
 * could be rewritten with minimal impact on the client code. That's the idea anyway.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Liam Mulhall (PhET Interactive Simulations)
 */


// modules
const _ = require( 'lodash' ); // eslint-disable-line
const assert = require( 'assert' );
const axios = require( 'axios' );
const octonode = require( 'octonode' );
const Queue = require( 'promise-queue' ); // eslint-disable-line
const RosettaConstants = require( './RosettaConstants' );
const winston = require( 'winston' );

// constants
const CONFIG = global.config;
const BABEL_BRANCH = global.config.babelBranch || 'master';
const BASE_URL_FOR_TRANSLATED_STRINGS = `${RosettaConstants.GITHUB_RAW_FILE_URL_BASE}/phetsims/babel/${BABEL_BRANCH}/`;
const GITHUB_RAW_FILE_URL_BASE = RosettaConstants.GITHUB_RAW_FILE_URL_BASE;

// for debug purposes, it is possible to set up the config file such that strings are not actually committed
const PERFORM_STRING_COMMITS = CONFIG.performStringCommits;

// create a handle to GitHub that will be used for all interactions
const ghClient = octonode.client( CONFIG.githubPersonalAccessToken );

// create a handle to the repo where strings are stored
const stringStorageRepo = ghClient.repo( 'phetsims/babel' );

// create the queue that will make the promises execute in sequential order
const promiseQueue = new Queue( 1, 1000 );

/**
 * retrieve the translated strings, if any, for the given locale and repo
 * @param {string} simOrLibName - name of the simulation or common-code repository where the translated strings reside
 * @param {string} locale
 * @returns {Promise.<string>} - the JSON object for the translated strings
 */
async function getTranslatedStrings( simOrLibName, locale ) {

  // We don't want non-English locales in this function!
  assert( locale !== 'en', 'This function should not be used for retrieving English strings' );

  // Form the URL and let user know what we're doing.
  const translatedStringsFileUrl = `${BASE_URL_FOR_TRANSLATED_STRINGS}${simOrLibName}/${simOrLibName}-strings_${locale}.json`;
  winston.info( `Requesting translated strings from GitHub. URL: ${translatedStringsFileUrl}` );

  let translatedStringsJsonObject = {};

  // Get the translated strings file from GitHub.
  try {
    const translatedStrings = await axios.get( translatedStringsFileUrl );
    translatedStringsJsonObject = translatedStrings.data;
    winston.debug( 'Got translated strings object.' );
  }
  catch( error ) {
    if ( error.response.status === 404 ) {
      winston.info( 'Requested strings file doesn\'t exist yet. Returning empty object.' );
      translatedStringsJsonObject = {};
    }
    else {
      const errorMessage = `Unable to get the translated strings JSON object. ${error.message}`;
      winston.error( errorMessage );
      throw new Error( errorMessage );
    }
  }

  return translatedStringsJsonObject;
}

/**
 * retrieve the English strings for a simulation or common-code library
 * @param {string} simOrLibName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} shaOrBranch
 * @returns {Promise.<string>}
 */
async function getEnglishStrings( simOrLibName, shaOrBranch = 'master' ) {

  // Form the URL and let user know what we're doing.
  const englishStringsFileUrl = `${GITHUB_RAW_FILE_URL_BASE}/phetsims/${simOrLibName}/${shaOrBranch}/${simOrLibName}-strings_en.json`;
  winston.info( `Requesting English strings file from GitHub. URL: ${englishStringsFileUrl}` );

  // Get the English strings file from GitHub.
  try {
    const englishStrings = await axios.get( englishStringsFileUrl );
    winston.debug( 'Got the English strings!' );
    const englishStringsJsonObject = englishStrings.data;
    return englishStringsJsonObject;
  }
  catch( error ) {
    const errorMessage = `Unable to get the English strings JSON object. ${error.message}`;
    winston.error( errorMessage );
    throw new Error( errorMessage );
  }
}

/**
 * compares the provided set of strings to those on GitHub, returns true if they are the same, false if not
 * @param {string} simOrLibName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @param {Object} strings
 * @returns {Promise.<boolean>}
 * @public
 */
async function stringsMatch( simOrLibName, locale, strings ) {
  const retrievedStrings = await getTranslatedStrings( simOrLibName, locale );
  return _.isEqual( strings, retrievedStrings );
}

/**
 * save a set of strings for the specified sim/lib and locale to GitHub
 * @param {string} simOrLibName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @param {Object} strings
 * @returns {Promise.<Object>}
 * @public
 */
function saveTranslatedStrings( simOrLibName, locale, strings ) {

  // the locale should never be English, since this is saving strings to GitHub
  assert( locale !== 'en', 'this function should not be used for saving English strings' );

  winston.debug( `saveTranslatedStrings called, simOrLibName = ${simOrLibName}, locale = ${locale}` );
  const filePath = `${simOrLibName}/${simOrLibName}-strings_${locale}.json`;
  const stringsInJson = JSON.stringify( strings, null, 2 );
  const commitMessage = `automated commit from rosetta for sim/lib ${simOrLibName}, locale ${locale}`;
  return promiseQueue.add( () => saveFileToGitHub( filePath, stringsInJson, commitMessage ) );
}

/**
 * Save the provided string data to GitHub, returns a Promise. This is needed because octonode, which is the package
 * that is being used to interface to GitHub, does not directly support promises.
 * @param {string} filePath
 * @param {string} contents
 * @param {string} commitMessage
 * @returns {Promise.<Object>}
 * @private
 */
function saveFileToGitHub( filePath, contents, commitMessage ) {

  // wrap the async calls that interact with GitHub into a promise
  return new Promise( ( resolve, reject ) => {

    if ( PERFORM_STRING_COMMITS ) {

      // test if the file already exists
      stringStorageRepo.contents( filePath, BABEL_BRANCH, ( err, data ) => {

        if ( !err ) {

          // update the existing file in GitHub
          stringStorageRepo.updateContents( filePath, commitMessage, contents, data.sha, BABEL_BRANCH, ( err, data ) => {
            if ( !err ) {
              winston.info( `successfully committed changes for file ${filePath}` );
              resolve( data );
            }
            else {
              winston.error( `unable to commit changes for file ${filePath}`, `, err = ${err}` );
              reject( err );
            }
          } );
        }
        else {

          // create a new file in GitHub
          stringStorageRepo.createContents( filePath, commitMessage, contents, BABEL_BRANCH, ( err, data ) => {
            if ( !err ) {
              winston.info( `successfully created file ${filePath}` );
              resolve( data );
            }
            else {
              winston.error( `unable to create file ${filePath}`, `, err = ${err}` );
              reject( err );
            }
          } );
        }
      } );
    }
    else {

      // Skip the string commits and just log the information about what would have been done.  This is a debug mode
      // that was added to prevent excessive commits to GitHub during testing.
      winston.warn( `commits skipped due to setting of a debug flag, file = ${filePath}` );
      resolve( {} );
    }

  } );
}

// export the functions for getting and setting the strings
module.exports = {
  getEnglishStrings: getEnglishStrings,
  getTranslatedStrings: getTranslatedStrings,
  stringsMatch: stringsMatch,
  saveTranslatedStrings: saveTranslatedStrings
};