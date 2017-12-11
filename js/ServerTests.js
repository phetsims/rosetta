// Copyright 2017, University of Colorado Boulder

/**
 * This file contains the server-side code for handling test requests.
 */

/* eslint-env node */
'use strict';

// modules
const LongTermStringStorage = require( './LongTermStringStorage' );
const winston = require( 'winston' );
const _ = require( 'underscore' ); // eslint-disable-line

/**
 * test handler object - each test is a method on this object
 */
let testHandlers = {

  /**
   * test rapidly requesting several string files
   * @return {Promise}
   */
  testRetrievingMultipleFilesFromGitHub: function() {

    // create a list of the files to retrieve
    let stringFilesToRetrieve = [
      // NOTE - use files that are on both master and the 'tests' branch
      { repoName: 'arithmetic', locale: 'es', expectedToExist: true },
      { repoName: 'chains', locale: 'ab', expectedToExist: true },
      { repoName: 'joist', locale: 'zh_CN', expectedToExist: true },
      { repoName: 'joist', locale: 'xy', expectedToExist: false },
      { repoName: 'blah', locale: 'es', expectedToExist: false }
    ];

    let stringRetrievalPromises = [];

    // create the promises for retrieving the strings
    stringFilesToRetrieve.forEach( function( stringFileSpec ) {

      stringRetrievalPromises.push(
        LongTermStringStorage.getStrings( stringFileSpec.repoName, stringFileSpec.locale )
          .then( () => {
              if ( stringFileSpec.expectedToExist ) {
                winston.log(
                  'info',
                  'strings successfully retrieved for sim/lib:',
                  stringFileSpec.repoName + ',',
                  'locale:',
                  stringFileSpec.locale
                );
                return Promise.resolve();
              }
              else {
                winston.log(
                  'error',
                  'strings retrieved, but this was not expected - sim/lib:',
                  stringFileSpec.repoName + ',',
                  'locale:',
                  stringFileSpec.locale
                );
                return Promise.reject( new Error( 'successful string retrieval not expected' ) );
              }
            }
          )
          .catch( err => {
            if ( !stringFileSpec.expectedToExist ) {
              winston.log(
                'info',
                'unable to obtain strings, which is the expected result, for sim/lib:',
                stringFileSpec.repoName + ',',
                'locale:',
                stringFileSpec.locale
              );
              return Promise.resolve();
            }
            else {
              winston.log(
                'error',
                'unable to get strings for sim/lib:',
                stringFileSpec.repoName + ',',
                'locale:',
                stringFileSpec.locale
              );
              return Promise.reject( err );
            }

          } )
      );
    } );

    return Promise.all( stringRetrievalPromises )
      .then( () => {

        // if all retrievals succeeded, the test passed
        return true;
      } );
  },

  /**
   * test the function that compares a set of strings to those in long-term storage
   * @return {Promise}
   */
  testStringMatch: function() {

    let stringComparePromises = [];

    // compare the strings with a completely different set, and make sure that they don't match
    stringComparePromises.push( LongTermStringStorage.getStrings( 'arithmetic', 'es' )
      .then( strings => {

        return LongTermStringStorage.stringsMatch( 'arithmetic', 'fr', strings )
          .then( result => {
            if ( !result ) {
              winston.log( 'info', 'comparison with known non-equal strings returned false as expected' );
            }
            else {
              winston.log( 'error', 'comparison with known non-equal strings returned true, which is a failure' );
            }
            return !result; // return the result - if the match failed, the test passed
          } );
      } )
    );

    // compare the strings with the same ones, and make sure they match
    stringComparePromises.push( LongTermStringStorage.getStrings( 'arithmetic', 'es' )
      .then( strings => {

        return LongTermStringStorage.stringsMatch( 'arithmetic', 'es', strings )
          .then( result => {
            if ( result ) {
              winston.log( 'info', 'comparison with same strings returned true as expected' );
            }
            else {
              winston.log( 'error', 'comparison with same strings returned false, which is a failure' );
            }
            return result; // return the result - if the match succeeded, so did the test
          } );
      } )
    );

    // make a change to one string, then compare, make sure they don't match
    stringComparePromises.push( LongTermStringStorage.getStrings( 'arithmetic', 'es' )
      .then( strings => {

        let firstKey = _.keys( strings )[ 0 ];
        strings[ firstKey ].value = strings[ firstKey ].value + 'X';

        return LongTermStringStorage.stringsMatch( 'arithmetic', 'es', strings )
          .then( result => {
            if ( !result ) {
              winston.log( 'info', 'comparison with modified strings returned false as expected' );
            }
            else {
              winston.log( 'error', 'comparison with modified strings returned true, which is a failure' );
            }
            return !result; // return the result - if the match failed, the test passed
          } );
      } )
    );

    return Promise.all( stringComparePromises )
      .then( results => {
        return _.every( results, result => result );
      } );
  },

  /**
   * test committing several files at once to GitHub
   * @return {Promise}
   */
  testCommittingMultipleFilesToGitHub: function() {

    // this test alters string files, so it is rejected if the tests branch is not being used
    if ( global.preferences.babelBranch !== 'tests' ){
      return Promise.reject( 'this test is only permitted when using the tests branch of the babel repo' );
    }

    // make a list of the strings to change - be careful here not to ever mess up real translations
    let simName = 'chains';
    let locales = [ 'ab', 'cs' ];
    let stringChangePromises = [];

    // get the strings, then modify them
    locales.forEach( function( locale ) {
      winston.log( 'info', 'getting strings for sim ' + simName + ', locale ' + locale );
      let modifyStringsPromise = LongTermStringStorage.getStrings( simName, locale )
        .then( strings => {

          // modify the first string to have a snapshot of the epoch number at the end, e.g. "My Sim---5409483029"
          let firstKey = _.keys( strings )[ 0 ];
          let firstStringValue = strings[ firstKey ].value;
          let dividerIndex = firstStringValue.indexOf( '---' );
          if ( dividerIndex !== -1 ) {
            firstStringValue = firstStringValue.substring( 0, dividerIndex );
          }
          strings[ firstKey ].value = firstStringValue + '---' + ( new Date().getTime() );
          return strings;
        } )
        .then( strings => {

          // save the modified strings to the long term storage area
          return LongTermStringStorage.saveStrings( simName, locale, strings );
        } );
      stringChangePromises.push( modifyStringsPromise );
    } );

    return Promise.all( stringChangePromises )
      .then( () => {

        // if all promises return without error the test passed
        return true;
      } );
  }
};

/**
 * function that executes the requested test if present and output the result
 * @param {string} testID
 */
module.exports.executeTest = function executeTest( testID ) {
  if ( testHandlers[ testID ] ) {
    winston.log( 'info', 'initiating test ' + testID );
    testHandlers[ testID ]()
      .then( result => {
        if ( result ) {
          winston.log( 'info', 'test ' + testID + ' result: PASS' );
        }
        else {
          winston.log( 'error', 'test ' + testID + ' result: FAIL' );
        }
      } )
      .catch( ( err ) => {
        winston.log( 'error', 'test ' + testID + ' result: FAIL, err = ' + err );
      } );
  }
  else {
    winston.log( 'error', 'requested test not defined, testID = ' + testID );
  }
};
