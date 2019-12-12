// Copyright 2018-2019, University of Colorado Boulder

/**
 * This file contains the server-side code for handling test requests.
 */

'use strict';

// modules
const _ = require( 'lodash' ); // eslint-disable-line
const longTermStringStorage = require( './longTermStringStorage' );
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const winston = require( 'winston' );

// constants
const PASS = true;
const FAIL = false;

/**
 * test handler object - each test is a method on this object. Use "executeTest" in this module to test these handlers.
 * To write a handler, create a function that will return truthy if the test passes, or falsey/throw error is fails.
 */
const testHandlers = {

  /**
   * test rapidly requesting several string files
   * @returns {Promise.<boolean>}
   */
  testRetrievingMultipleFilesFromGitHub: function() {

    // create a list of the files to retrieve
    const stringFilesToRetrieve = [
      // NOTE - use files that are on both master and the 'tests' branch
      { repoName: 'arithmetic', locale: 'es', expectedToExist: true },
      { repoName: 'chains', locale: 'ab', expectedToExist: true },
      { repoName: 'joist', locale: 'zh_CN', expectedToExist: true },
      { repoName: 'joist', locale: 'xy', expectedToExist: false },
      { repoName: 'blah', locale: 'es', expectedToExist: false }
    ];

    const stringRetrievalPromises = [];

    // create the promises for retrieving the strings
    stringFilesToRetrieve.forEach( function( stringFileSpec ) {

      stringRetrievalPromises.push(
        longTermStringStorage.getTranslatedStrings( stringFileSpec.repoName, stringFileSpec.locale )
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
   * @returns {Promise.<boolean>}
   */
  testStringMatch: function() {

    const stringComparePromises = [];

    // compare the strings with a completely different set, and make sure that they don't match
    stringComparePromises.push( longTermStringStorage.getTranslatedStrings( 'arithmetic', 'es' )
      .then( strings => {

        return longTermStringStorage.stringsMatch( 'arithmetic', 'fr', strings )
          .then( result => {
            if ( !result ) {
              winston.info( 'comparison with known non-equal strings returned false as expected' );
            }
            else {
              winston.error( 'comparison with known non-equal strings returned true, which is a failure' );
            }
            return !result; // return the result - if the match failed, the test passed
          } );
      } )
    );

    // compare the strings with the same ones, and make sure they match
    stringComparePromises.push( longTermStringStorage.getTranslatedStrings( 'arithmetic', 'es' )
      .then( strings => {

        return longTermStringStorage.stringsMatch( 'arithmetic', 'es', strings )
          .then( result => {
            if ( result ) {
              winston.info( 'comparison with same strings returned true as expected' );
            }
            else {
              winston.error( 'comparison with same strings returned false, which is a failure' );
            }
            return result; // return the result - if the match succeeded, so did the test
          } );
      } )
    );

    // make a change to one string, then compare, make sure they don't match
    stringComparePromises.push( longTermStringStorage.getTranslatedStrings( 'arithmetic', 'es' )
      .then( strings => {

        const firstKey = _.keys( strings )[ 0 ];
        strings[ firstKey ].value = strings[ firstKey ].value + 'X';

        return longTermStringStorage.stringsMatch( 'arithmetic', 'es', strings )
          .then( result => {
            if ( !result ) {
              winston.info( 'comparison with modified strings returned false as expected' );
            }
            else {
              winston.error( 'comparison with modified strings returned true, which is a failure' );
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
   * @returns {Promise.<boolean>}
   */
  testCommittingMultipleFilesToGitHub: function() {

    // this test alters string files, so it is rejected if the tests branch is not being used
    if ( global.config.babelBranch !== 'tests' ) {
      return Promise.reject( new Error( 'this test is only permitted when using the tests branch of the babel repo' ) );
    }

    // make a list of the strings to change - be careful here not to ever mess up real translations
    const simName = 'chains';
    const locales = [ 'ab', 'cs' ];
    const stringChangePromises = [];

    // get the strings, then modify them
    locales.forEach( function( locale ) {
      winston.info( 'getting strings for sim ' + simName + ', locale ' + locale );
      const modifyStringsPromise = longTermStringStorage.getTranslatedStrings( simName, locale )
        .then( strings => {

          // modify the first string to have a snapshot of the epoch number at the end, e.g. "My Sim---5409483029"
          const firstKey = _.keys( strings )[ 0 ];
          let firstStringValue = strings[ firstKey ].value;
          const dividerIndex = firstStringValue.indexOf( '---' );
          if ( dividerIndex !== -1 ) {
            firstStringValue = firstStringValue.substring( 0, dividerIndex );
          }
          strings[ firstKey ].value = firstStringValue + '---' + ( new Date().getTime() );
          return strings;
        } )
        .then( strings => {

          // save the modified strings to the long term storage area
          return longTermStringStorage.saveTranslatedStrings( simName, locale, strings );
        } );
      stringChangePromises.push( modifyStringsPromise );
    } );

    return Promise.all( stringChangePromises )
      .then( () => {

        // if all promises return without error the test passed
        return true;
      } );
  },

  /**
   * temporary test, put unit tests in here as needed
   * @returns {Object}
   */
  testTemp: async function() {
    const res = await nodeFetch( 'https://phet.colorado.edu/services/metadata/1.2/simulations?format=json&type=html&locale=en&simulation=neuron&summary' );
    const json = await res.json();
    console.log( json );
    return json;
  }

};

/**
 * function that executes the requested test if present and output the result
 * @param {string} testID
 * @returns {Object} - {boolean} `testPass` and {string|Error} [err]
 */
module.exports.executeTest = async function executeTest( testID ) {
  if ( testHandlers[ testID ] ) {
    winston.info( 'initiating test ' + testID );

    try {
      const result = await testHandlers[ testID ]();
      if ( result ) {
        return { testPass: PASS };
      }
      else {
        return { testPass: FAIL };
      }
    }
    catch( err ) {
      return { testPass: FAIL, err: err };
    }
  }
  else {
    const errorMessage = 'requested test not defined, testID = ' + testID;
    winston.error( errorMessage );
    return { err: errorMessage };
  }
};

/**
 * Run all server tests, using the `executeTest method`
 * @returns {Object}
 */
module.exports.runTests = async function() {

  const testSummary = {
    passed: 0,
    failed: 0
  };
  for ( const testName of Object.keys( testHandlers ) ) {
    winston.info( `\n\n\nRunning test ${testName}` );

    const { testPass, err } = await this.executeTest( testName );

    if ( testPass ) {
      winston.info( 'test ' + testName + ' result: PASS' );
      testSummary.passed += 1;
    }
    else {
      const errMessage = err ? `, err = ${err}` : '';
      winston.info( 'test ' + testName + ' result: PASS' + errMessage );
      testSummary.failed += 1;
    }

  }

  const numberOfTests = Object.keys( testHandlers ).length;
  const summary = `Tests completed, ran ${numberOfTests} tests, ${testSummary.passed} passed, ${testSummary.failed} failed.`;

  winston.info( summary );

  return { result: summary };

};