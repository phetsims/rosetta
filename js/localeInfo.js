// Copyright 2018-2019, University of Colorado Boulder
/**
 * A singleton object that contains information about the locales into which sims can be translated.
 *
 * @author John Blanco
 * @author Michael Kauzmann
 */

'use strict';
// imports
const _ = require( 'lodash' ); // eslint-disable-line
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const RosettaConstants = require( './RosettaConstants' );
const winston = require( 'winston' );

// constants
const CACHED_DATA_VALID_TIME = 86400; // in seconds

// timestamp when the sim info was last updated, used to determine whether to use cached data
let timeOfLastUpdate = 0;

// locale info object - populated by obtaining file from GitHub, used as a cache, updated when needed
let localeInfoObject = {};

// locale info in an array, sorted by locale name
let sortedLocaleInfoArray = [];

// outstanding promise for getting locale info file, used to avoid creating duplicate requests if once is already in progress
let inProgressFileRetrievalPromise = null;

// function that updates the local copy of the sim info by retrieving and interpreting file from GitHub
async function updateLocaleInfo() {
  const urlOfLocalInfoFile = RosettaConstants.GITHUB_RAW_FILE_URL_BASE + '/phetsims/chipper/master/js/data/localeInfo.js';

  winston.log( 'info', 'requesting locale info file from GitHub, URL = ' + urlOfLocalInfoFile );

  const response = await nodeFetch( urlOfLocalInfoFile );

  // handle the response
  if ( response.status === 200 ) {

    // The file was obtained successfully.  This particular file is JavaScript, not JSON, so it needs to be interpreted.
    const fileContent = await response.text();

    localeInfoObject = requireFromString( fileContent, 'chipperLocalInfo' );

    // update the sorted locale info array
    sortedLocaleInfoArray = [];
    for ( const locale in localeInfoObject ) {
      if ( locale !== 'en' && localeInfoObject.hasOwnProperty( locale ) ) {
        sortedLocaleInfoArray.push( {
          code: locale,
          name: localeInfoObject[ locale ].name,
          localizedName: localeInfoObject[ locale ].localizedName,
          direction: localeInfoObject[ locale ].direction
        } );
      }
    }
    sortedLocaleInfoArray.sort( function( a, b ) {
      if ( a.name > b.name ) {
        return 1;
      }
      if ( a.name < b.name ) {
        return -1;
      }
      return 0;
    } );

    timeOfLastUpdate = Date.now();
  }

  else {
    if ( _.keys( localeInfoObject ).length === 0 ) {
      winston.error( 'unable to retrieve locale info, there is no cache to fall back to, response.status = ' + response.status );
    }
    else {
      winston.error( 'unable to retrieve locale info, using cache, response.status = ' + response.status );
    }
  }
}

/**
 * To get chipper's locale info, we need it loaded as a module. This function supports requiring a module
 * from a string. Although thoroughly tested, it seems a bit strange to reach into a private (_compile) function.
 * This function was found at https://stackoverflow.com/questions/17581830/load-node-js-module-from-string-in-memory
 * @param {string} src - the source code of the module
 * @param {string} filename - the name of the module
 * @returns {Module} - the module
 */
function requireFromString( src, filename ) {
  const Module = module.constructor;
  const m = new Module();
  m._compile( src, filename );
  return m.exports;
}

// function that updates cached data if it is time to do so
async function checkAndUpdateLocaleInfo() {

  // if a request is already in progress, return that promise
  if ( inProgressFileRetrievalPromise ) {
    winston.info( 'a request for locale info file is in progress, waiting on that promise' );
    await inProgressFileRetrievalPromise;
  }
  else if ( ( Date.now() - timeOfLastUpdate ) / 1000 > CACHED_DATA_VALID_TIME ) {
    winston.info( 'locale info data was stale, initiating a new request' );
    inProgressFileRetrievalPromise = updateLocaleInfo();
    await inProgressFileRetrievalPromise;
    inProgressFileRetrievalPromise = null; // clear out the promise when it's done
  }
  else {
    winston.info( 'using cached locale info' );
  }
}

// kick off the initial population of the sim data
checkAndUpdateLocaleInfo()
  .then( () => { winston.info( 'initial population of localeInfo object complete' ); } )
  .catch( ( err ) => winston.info( 'initial population of localeInfo object failed, err = ' + err ) );

// exported singleton object
module.exports = {

  /**
   * get the locale information as an object that matches how it is stored in chipper
   * @returns {Promise.<Object>}
   * @public
   */
  getLocaleInfoObject: async function() {
    await checkAndUpdateLocaleInfo();
    return localeInfoObject;
  },

  // TODO: temp for debug
  localeInfoObject: localeInfoObject,

  /**
   * get the locale info as an array sorted by locale
   * @returns {Promise.<Array<Object>>}
   * @public
   */
  getSortedLocaleInfoArray: async function() {
    await checkAndUpdateLocaleInfo();
    return sortedLocaleInfoArray;
  },

  /**
   * Obtain a string that describes the language associated with the provided locale.  For example, if the caller
   * specified 'es_MX', the string 'Spanish - Mexico' would be returned.
   * @param {string} locale
   * @returns {string}
   * @public
   */
  localeToLanguageString: function( locale ) {
    // since this happens a lot, and locale info rarely changes, the cached data is always used, i.e. no update is made.
    if ( localeInfoObject.hasOwnProperty( locale ) ) {
      return localeInfoObject[ locale ].name;
    }
    else {
      winston.error( 'request received for locale that is not in the locale info object' );
      return '';
    }
  }
};
