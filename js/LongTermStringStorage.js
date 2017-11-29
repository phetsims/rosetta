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
var constants = require( './constants' );
// var octonode = require( 'octonode' );
var request = require( 'request' );
var winston = require( 'winston' );

// constants
// var PREFERENCES = global.preferences;
var BRANCH = global.preferences.babelBranch || 'master';
var BASE_URL_FOR_RAW_FILES = constants.GITHUB_RAW_FILE_URL_BASE + '/phetsims/babel/' + BRANCH + '/';

// create a handle to GitHub that will be used for all interactions
// var ghClient = octonode.client( {
//   username: PREFERENCES.githubUsername,
//   password: PREFERENCES.githubPassword
// } );

// create a handle to the repo where strings are stored
// var stringStorageRepo = ghClient.repo( 'phetsims/babel' );

module.exports = {

  /**
   * retrieve the stored strings for the given locale and repo
   * @param {string} repoName - name of the simulation or common-code repository where the untranslated strings reside
   * @param {string} locale
   * @param {function} callback - function to be called once the strings have been obtained
   * @return {Object|null} - map of string keys to the string values
   */
  getStrings: function( repoName, locale, callback ) {

    // it is faster and simpler to pull the strings directly from the raw URL than to use the octonode client
    var rawStringFileURL = BASE_URL_FOR_RAW_FILES + repoName + '/' + repoName + '-strings_' + locale + '.json';
    winston.log( 'info', 'requesting raw file from GitHum, URL = ' + rawStringFileURL );

    request( rawStringFileURL, function( error, response, body ) {
      if ( !error && response.statusCode === 200 ) {
        winston.log( 'info', 'request for strings for repo ' + repoName + ', locale ' + locale + ' succeeded' );
        callback( error, JSON.parse( body ) );
      }
      else if ( !error && response.statusCode === 404 ){
        winston.log( 'info', 'strings for repo ' + repoName + ', locale ' + locale + ' not found' );
        callback( error, null );
      }
      else {
        winston.log(
          'error',
          'problem obtaining strings for repo ' + repoName + ', locale ' + locale + ' failed, response code = ' +
          response.statusCode, ' error = ' + JSON.stringify( error ) );
        callback( error, null );
      }
    } );
  },

  stringSetExists: function( locale, repo ) {
    winston.log( 'info', 'stringSetExists called' );
  }
};