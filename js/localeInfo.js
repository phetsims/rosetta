// Copyright 2018-2021, University of Colorado Boulder

/**
 * A singleton object that contains information about the locales into which sims can be translated.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Liam Mulhall (PhET Interactive Simulations)
 */

'use strict';

// modules
const axios = require( 'axios' );
const RosettaConstants = require( './RosettaConstants' );
const winston = require( 'winston' );

// constants
const CACHED_DATA_VALID_TIME = 86400; // This is in seconds.
const GITHUB_RAW_FILE_URL_BASE = RosettaConstants.GITHUB_RAW_FILE_URL_BASE;

// timestamp when the sim info was last updated, used to determine whether to use cached data
let timeOfLastUpdate = 0;

// locale info object - populated by obtaining file from GitHub, used as a cache, updated when needed
let localeInfoObject = {};

// locale info in an array, sorted by locale name
let sortedLocaleInfoArray = [];

// outstanding promise for getting locale info file, used to avoid creating duplicate requests if one is already in progress
let inProgressFileRetrievalPromise = null;

// Updates the local copy of the locale info by retrieving and interpreting file from GitHub.
async function updateLocaleInfo() {

  // Set boolean for whether localeInfoObject has cache.
  const localeInfoObjectHasCache = Object.keys( localeInfoObject ).length !== 0;

  // Get the locale info object from GitHub.
  const localeInfoUrl = `${GITHUB_RAW_FILE_URL_BASE}/phetsims/chipper/master/data/localeInfo.json`;
  winston.info( `Requesting locale info file from GitHub. URL: ${localeInfoUrl}` );
  try {
    const localeInfo = await axios.get( localeInfoUrl );
    localeInfoObject = localeInfo.data;
  }
  catch( error ) {
    if ( localeInfoObjectHasCache ) {
      const errorMessage = `Unable to get localeInfoObject; using cache. ${error.message}`;
      winston.error( errorMessage );
      throw new Error( errorMessage );
    }
    else {
      const errorMessage = `Unable to get localeInfoObject; no cache to fall back to. ${error.message}`;
      winston.error( errorMessage );
      throw new Error( errorMessage );
    }
  }

  // Make sure sortedLocaleInfoArray is empty, then add locales to the array.
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

  // Sort the locales by locale name (not locale code), e.g. sort by Slovak not sk, and set time of last update to now.
  sortedLocaleInfoArray.sort( ( localeA, localeB ) => {
    if ( localeA.name < localeB.name ) {
      return -1;
    }
    if ( localeA.name > localeB.name ) {
      return 1;
    }
    return 0;
  } );
  timeOfLastUpdate = Date.now();
}

/**
 * update cached data if it is time to do so
 * @returns {Promise.<void>}
 */
async function checkAndUpdateLocaleInfo() {

  // if a request is already in progress, return that promise
  if ( inProgressFileRetrievalPromise ) {
    winston.info( 'a request for locale info file is in progress, waiting on that promise' );
    await inProgressFileRetrievalPromise;
  }
  else if ( ( Date.now() - timeOfLastUpdate ) / 1000 > CACHED_DATA_VALID_TIME ) { // Liam's Note: Maybe create a boolean for this to increase readability.
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
  .catch( err => winston.info( `initial population of localeInfo object failed, err = ${err}` ) );

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

  /**
   * get the locale info as an array sorted by locale
   * @returns {Promise.<Array.<Object>>}
   * @public
   */
  getSortedLocaleInfoArray: async function() {
    await checkAndUpdateLocaleInfo();
    return sortedLocaleInfoArray;
  }
};