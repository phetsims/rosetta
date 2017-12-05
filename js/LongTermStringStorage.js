// Copyright 2017, University of Colorado Boulder

/**
 * This file defines a singleton object that is used for long term storage of the translated strings.  It is called
 * "long term" to distinguish it from the short term storage that can occur if a user decides to save a translation
 * without submitting it.
 *
 * This implementation uses GitHub as the "back end" where the strings are stored, but it is intended to be a fairly
 * generic interface so that if we ever decide to use something else as the storage medium for strings, this could be
 * rewritten without impacting portions of the code.  That's the idea anyway.
 */

/* eslint-env node */
'use strict';

// modules
let constants = require( './constants' );
let nodeFetch = require( 'node-fetch' ); // eslint-disable-line
let octonode = require( 'octonode' );
let _ = require( 'underscore' ); // eslint-disable-line
let winston = require( 'winston' );

// constants
let PREFERENCES = global.preferences;
let BRANCH = global.preferences.babelBranch || 'master';
let BASE_URL_FOR_RAW_FILES = constants.GITHUB_RAW_FILE_URL_BASE + '/phetsims/babel/' + BRANCH + '/';

// create a handle to GitHub that will be used for all interactions
let ghClient = octonode.client( {
  username: PREFERENCES.githubUsername,
  password: PREFERENCES.githubPassword
} );

// create a handle to the repo where strings are stored
let stringStorageRepo = ghClient.repo( 'phetsims/babel' );

// TODO: Document the parameters for the callback functions when they are finalized

/**
 * retrieve the stored strings for the given locale and repo
 * @param {string} repoName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @return {Promise}
 */
function getStrings( repoName, locale ) {

  // it is faster and simpler to pull the strings directly from the raw URL than to use the octonode client
  let rawStringFileURL = BASE_URL_FOR_RAW_FILES + repoName + '/' + repoName + '-strings_' + locale + '.json';
  winston.log( 'info', 'requesting raw file from GitHub, URL = ' + rawStringFileURL );

  return nodeFetch( rawStringFileURL, { compress: false } ).then( response => {
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
  } );
}

/**
 * compares the provided set of strings to those on GitHub, returns true if they are the same, false if not
 * @param {string} repoName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @param {Object} strings
 * @param {function} callback - function to be called once the strings have been compared
 */
function stringsMatch( repoName, locale, strings, callback ) {

  getStrings( repoName, locale, function( error, response, stringsFromRepo ) {
    let stringsMatch = false;
    if ( !error ) {
      stringsMatch = _.isEqual( stringsFromRepo, strings );
    }
    callback( error, stringsMatch );
  } );
}

/**
 * save a set of string to GitHub
 * @param {string} repoName - name of the simulation or common-code repository where the untranslated strings reside
 * @param {string} locale
 * @param {Object} strings
 * @param {function} callback - function to be called once the strings have been saved (or not if there is an error)
 */
function saveStrings( repoName, locale, strings, callback ) {

  getStrings( repoName, locale, function( error, response, stringsFromRepo ) {
    if ( stringsFromRepo ) {
      if ( !_.isEqual( stringsFromRepo, strings ) ) {
        winston.log(
          'info',
          'initiating commit of changed string for sim/lib ' + repoName + ', locale ' + locale
        );

        let filePath = repoName + '/' + repoName + '-strings_' + locale + '.json';
        let commitMessage = Date.now() + ' automated commit from rosetta for file ' + filePath;
        let stringsInJson = JSON.stringify( strings, null, 2 );

        // get the current contents via octonode because we need the SHA (there may be a better way to do this)
        stringStorageRepo.contents( filePath, BRANCH, function( err, data, headers ) {

          let sha = data.sha;

          if ( !err ) {

            // commit the changed string file to the babel repo in GitHub
            stringStorageRepo.updateContents(
              filePath,
              commitMessage,
              stringsInJson,
              sha,
              BRANCH,
              function( err, data, headers ) {
                if ( !err ) {
                  winston.log(
                    'info',
                    'successfully committed string changes for sim/lib ' + repoName + ', locale ' + locale
                  );
                }
                else {
                  winston.log(
                    'error',
                    'error committing string changes for sim/lib ' + repoName + ', locale ' + locale + ', error message = ' + err.message
                  );
                }
                callback( err === null );
              }
            );
          }
          else {
            winston.log(
              'error',
              'Unexpected error when retrieving string file, error = ' + err.toString()
            );
            callback( false );
          }
        } );
      }
      else {

        // no need to save strings that already match
        winston.log(
          'info',
          'saveStrings skipping commit because strings already match for sim/lib ' + repoName + ', locale ' + locale
        );
        callback( true );
      }
    }
    else {
      callback( false );
    }
  } );
}

/**
 * save the specified strings to GitHub
 * @param repo
 * @param locale
 * @param strings
 */


// export the functions for getting and setting the strings
module.exports = {
  getStrings: getStrings,
  stringsMatch: stringsMatch,
  saveStrings: saveStrings
};