// Copyright 2017, University of Colorado Boulder

/**
 * This file defines a singleton object that is used for long term storage of the translated strings.  It is called
 * "long term" to distinguish it from the short term storage that can occur if a user decides to save an in-progress
 * translation without submitting it as a completed translation.
 *
 * This implementation uses GitHub as the "back end" where the strings are stored, but it is intended to be a fairly
 * generic interface so that if we ever decide to use something else as the storage medium for strings, this object
 * could be rewritten with minimal impact on the client code.  That's the idea anyway.
 */

/* eslint-env node */
'use strict';

// modules
const constants = require( './constants' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const octonode = require( 'octonode' );
const Queue = require( 'promise-queue' ); // eslint-disable-line
const _ = require( 'underscore' ); // eslint-disable-line
const winston = require( 'winston' );

// constants
const PREFERENCES = global.preferences;
const BRANCH = PREFERENCES.babelBranch || 'master';
const BASE_URL_FOR_RAW_FILES = constants.GITHUB_RAW_FILE_URL_BASE + '/phetsims/babel/' + BRANCH + '/';
const SKIP_STRING_COMMITS = typeof PREFERENCES.debugRosettaSkipStringCommits !== 'undefined' &&
                            PREFERENCES.debugRosettaSkipStringCommits === 'true';

// create a handle to GitHub that will be used for all interactions
const ghClient = octonode.client( {
  username: PREFERENCES.githubUsername,
  password: PREFERENCES.githubPassword
} );

// create a handle to the repo where strings are stored
const stringStorageRepo = ghClient.repo( 'phetsims/babel' );

// create the queue that will make the promises execute in sequential order
const promiseQueue = new Queue( 1, 1000 );

/**
 * retrieve the stored strings for the given locale and repo
 * @param {string} simOrLibName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @return {Promise.<string>}
 * @public
 */
async function getStrings( simOrLibName, locale ) {

  // it is faster and simpler to pull the strings directly from the raw URL than to use the octonode client
  const rawStringFileURL = BASE_URL_FOR_RAW_FILES + simOrLibName + '/' + simOrLibName + '-strings_' + locale + '.json';
  winston.log( 'info', 'requesting raw file from GitHub, URL = ' + rawStringFileURL );

  // get the file from GitHub
  const response = await nodeFetch( rawStringFileURL, { compress: false } );

  // handle the response
  if ( response.status === 200 ) {

    // the file was obtained successfully
    return response.json();
  }
  else if ( response.status === 404 ) {
    return Promise.reject( new Error( 'file not found (response.status = ' + response.status ) + ')' );
  }
  else {
    return Promise.reject( new Error( 'error getting strings (response.status = ' + response.status ) + ')' );
  }
}

/**
 * compares the provided set of strings to those on GitHub, returns true if they are the same, false if not
 * @param {string} simOrLibName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @param {Object} strings
 * @return {Promise.<boolean>}
 * @public
 */
async function stringsMatch( simOrLibName, locale, strings ) {
  const retrievedStrings = await getStrings( simOrLibName, locale );
  return _.isEqual( strings, retrievedStrings );
}

/**
 * save a set of strings for the specified sim/lib and locale to GitHub
 * @param {string} simOrLibName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @param {Object} strings
 * @return {Promise.<Object>}
 * @public
 */
function saveStrings( simOrLibName, locale, strings ) {
  const filePath = simOrLibName + '/' + simOrLibName + '-strings_' + locale + '.json';
  const stringsInJson = JSON.stringify( strings, null, 2 );
  const commitMessage = 'automated commit from rosetta for sim/lib ' + simOrLibName + ', locale ' + locale;
  return promiseQueue.add( function(){ return saveFileToGitHub( filePath, stringsInJson, commitMessage ); } );
}

/**
 * Save the provided string data to GitHub, returns a Promise.  This is needed because octonode, which is the package
 * that is being used to interface to GitHub, does not support promises.
 * @param {string} filePath
 * @param {string} contents
 * @param {string} commitMessage
 * @returns {Promise.<Object>}
 * @private
 */
function saveFileToGitHub( filePath, contents, commitMessage ) {

  // wrap the async calls that interact with GitHub into a promise
  return new Promise( function( resolve, reject ) {

    if ( !SKIP_STRING_COMMITS ){

      // attempt to get the file and metadata from GitHub
      stringStorageRepo.contents( filePath, BRANCH, function( err, data ) {

        if ( !err ) {

          // update the existing file in GitHub
          stringStorageRepo.updateContents( filePath, commitMessage, contents, data.sha, BRANCH, function( err, data ) {
            if ( !err ) {
              winston.log( 'info', 'successfully committed changes for file ' + filePath );
              resolve( data );
            }
            else {
              winston.log( 'error', 'unable to commit changes for file ' + filePath, ', err = ' + err );
              reject( err );
            }
          } );
        }
        else {

          // create a new file in GitHub
          stringStorageRepo.createContents( filePath, commitMessage, contents, BRANCH, function( err, data ) {
            if ( !err ) {
              winston.log( 'info', 'successfully created file ' + filePath );
              resolve( data );
            }
            else {
              winston.log( 'error', 'unable to create file ' + filePath, ', err = ' + err );
              reject( err );
            }
          } );
        }
      } );
    }
    else{

      // Skip the string commits and just log the information about what would have been done.  This is a debug mode
      // that was added to prevent excessive commits to GitHub during testing.
      winston.log( 'warn', 'commits skipped due to setting of a debug flag, file = ' + filePath );
      resolve( {} );
    }

  } );
}

// export the functions for getting and setting the strings
module.exports = {
  getStrings: getStrings,
  stringsMatch: stringsMatch,
  saveStrings: saveStrings
};