// Copyright 2018-2020, University of Colorado Boulder

/**
 * A singleton object that contains information about the published simulations. The specific information contained is
 * that which is needed by Rosetta, the PhET translation utility, to do its job. This object is populated by obtaining
 * sim metadata from the server where the simulations reside.
 *
 * @author John Blanco
 * @author Liam Mulhall
 */

'use strict';

// Modules
const _ = require( 'lodash' ); // eslint-disable-line
const https = require( 'https' );
const winston = require( 'winston' );

// Constants
const CACHED_DATA_VALID_TIME = 1800; // This is 1.8 seconds in milliseconds.
const PRODUCTION_SERVER_URL = global.config.productionServerURL;

//===========================================================================//
// Set up variables for later use.                                           //
//===========================================================================//

// Timestamp when the sim info was last updated. Used to determine whether to use cached data.
let timeOfLastUpdate = 0;

// Populated by obtaining metadata from the PhET website. Used as a cache. Updated when needed.
const simInfoObject = {};

// Outstanding promise for getting metadata. Used to avoid creating duplicate requests if one is already in progress.
let inProgressMetadataPromise = null;

// Used for metadata request.
const url = PRODUCTION_SERVER_URL +
            '/services/metadata/1.2/simulations?format=json&type=html&include-unpublished=true&summary';
const options = {
  auth: `token:${global.config.serverToken}`
};

//===========================================================================//
// Set up main functions for metadata retrieval and update.                  //
//===========================================================================//

// Get the sim metadata from the PhET site.
function getSimMetadata() {
  return new Promise( ( resolve, reject ) => {
    const request = https.request( url, options, response => {

      // Set up variables for error logging.
      const { statusCode } = response;
      const contentType = response.headers[ 'content-type' ];

      // Log incorrect return codes or incorrect metadata type.
      if ( statusCode !== 200 ) {
        winston.error( 'Metadata request failed.\n' +
                       `Status Code: ${statusCode}` );
        return;
      }
      else if ( !/^text\/html/.test( contentType ) ) {
        winston.error( 'Invalid content-type.\n' +
                       `Expected text/html but received ${contentType}.` );
        winston.debug( contentType );
        return;
      }

      // Set encoding and variable for metadata.
      response.setEncoding( 'utf-8' );
      let rawData = '';

      // Add metadata.
      response.on( 'data', chunk => {
        rawData += chunk;
      } );

      // Resolve metadata.
      response.on( 'end', () => {
        try {
          const parsedData = JSON.parse( rawData );
          resolve( parsedData );
        }
        catch( error ) {
          winston.error( 'Parsing metadata failed.' );
          reject( error );
        }
      } );
    } );

    // Reject errors and finish sending the request.
    request.on( 'error', error => {
      reject( error );
    } );
    request.end();
  } );
}

// Update the local copy of the sim metadata (the sim info).
async function updateSimInfo() {

  // Get metadata.
  let simMetadata = null;
  try {
    simMetadata = await getSimMetadata();
  }
  catch( error ) {
    const errorToThrow = new Error( `The getSimMetadata function call failed. Error: ${error}.` );
    winston.error( errorToThrow.message );
    throw errorToThrow;
  }

  // If any part of simMetadata is undefined, throw an error. Otherwise, update sim info.
  if ( !simMetadata ) {
    const errorToThrow = new Error( 'Unable to obtain simMetadata. Sim info not updated.' );
    winston.error( errorToThrow.message );
    throw errorToThrow;
  }
  else if ( !simMetadata.projects ) {
    const errorToThrow = new Error( 'Unable to obtain simMetadata.projects. Sim info not updated.' );
    winston.error( errorToThrow.message );
    throw errorToThrow;
  }
  else {

    // Extract subset of metadata needed by the translation utility and save it in the sim info object.
    simMetadata.projects.forEach( projectInfo => {
      projectInfo.simulations.forEach( simulationInfo => {
        const simName = simulationInfo.name;
        const translationLocales = [];
        let englishTitle = '';
        simulationInfo.localizedSimulations.forEach( localizedSimData => {
          translationLocales.push( localizedSimData.locale );
          if ( localizedSimData.locale === 'en' ) {
            englishTitle = localizedSimData.title;
          }
        } );

        simInfoObject[ simName ] = {
          englishTitle: englishTitle,
          simUrl: PRODUCTION_SERVER_URL + '/sims/html/' + simName + '/latest/' + simName + '_en.html',
          translationLocales: translationLocales,
          visible: simulationInfo.visible,
          version: projectInfo.version.string
        };
      } );
    } );
    timeOfLastUpdate = Date.now();
  }
}

// Update cached data if it is time to do so.
async function checkAndUpdateSimInfo() {

  // If a request is already in progress, return that promise.
  if ( inProgressMetadataPromise ) {
    winston.debug( 'A request for metadata is in progress. Waiting on that promise.' );

    try {
      await inProgressMetadataPromise;
    }
    catch( error ) {
      winston.error( 'Promise returned by updateSimInfo failed (secondary await path).' );
    }
  }
  else if ( ( Date.now() - timeOfLastUpdate ) / 1000 > CACHED_DATA_VALID_TIME ) {
    winston.debug( 'Sim data was stale. Initiating a new request.' );

    // Use the promise explicitly so that if other requests are received before this is resolved, they can also wait
    // on it.
    inProgressMetadataPromise = updateSimInfo();
    try {
      await inProgressMetadataPromise;
    }
    catch( error ) {

      // There really isn't much that can be done here other than to hope that the next attempt succeeds.
      winston.error( `Promise returned by updateSimInfo failed. Error: ${error}.` );
      throw Error( error );
    }

    // Clear out the promise for the next attempt.
    inProgressMetadataPromise = null;
  }
  else {
    winston.debug( 'Using cached sim info.' );
  }
}

// Kick off the initial population of the sim data.
checkAndUpdateSimInfo()
  .then( () => { winston.info( 'Initial population of simInfoObject complete.' ); } )
  .catch( error => winston.error( `Initial population of simInfoObject failed. Error: ${error}.` ) );

//===========================================================================//
// Export singleton object.                                                  //
//===========================================================================//

module.exports = {

  /**
   * Get a list of the HTML5 sims that are available on the PhET website.
   * @param {boolean} includeUnpublished
   * @returns {Promise.<Array.<string>>}
   * @public
   */
  getListOfSimNames: async function( includeUnpublished ) {

    await checkAndUpdateSimInfo();

    // Get a list of all sims. (Remember that we are only working with HTML5 sims here.)
    let simNames = _.keys( simInfoObject );

    // Unpublished (AKA invisible) sims are present by default, so if the flag says that they should NOT be included,
    // they need to be removed.
    if ( !includeUnpublished ) {
      const simNamesToExclude = [];
      simNames.forEach( sim => {
        if ( !simInfoObject[ sim ].visible ) {
          simNamesToExclude.push( sim );
        }
      } );
      simNames = _.difference( simNames, simNamesToExclude );
    }
    return simNames;
  },

  /**
   * Get an array of objects where each object contains the project-name, title, and published URL of the simulations
   * that are available on the website. The format is that which is needed to render the main translation selection
   * page, and is a bit historic, if background is needed please see https://github.com/phetsims/rosetta/issues/123.
   * @param {boolean} includeUnpublished
   * @returns {Promise.<Array>}
   * @public
   */
  getSimTranslationPageInfo: async function( includeUnpublished ) {
    await checkAndUpdateSimInfo();
    const simInfoArray = [];
    _.keys( simInfoObject ).forEach( projectName => {
      if ( simInfoObject[ projectName ].visible || includeUnpublished ) {
        simInfoArray.push( {
          projectName: projectName,
          simTitle: simInfoObject[ projectName ].englishTitle,
          testUrl: simInfoObject[ projectName ].simUrl
        } );
      }
    } );
    return simInfoArray;
  },

  /**
   * Get the URL where the simulation is available from the website.
   * @param {string} simName
   * @returns {Promise.<string|null>}
   * @public
   */
  getLiveSimUrl: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
      return null;
    }
    return simInfoObject[ simName ].simUrl;
  },

  /**
   * Get the English translation of the title for the specified simulation.
   * @param {string} simName
   * @returns {Promise.<string>}
   * @public
   */
  getEnglishTitle: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
      return '';
    }
    return simInfoObject[ simName ].englishTitle;
  },

  /**
   * Get the latest version for a simulation.
   * @param {string} simName
   * @returns {Promise<string>}
   * @public
   */
  getLatestSimVersion: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
      return '';
    }
    return simInfoObject[ simName ].version;
  }
};