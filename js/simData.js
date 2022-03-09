// Copyright 2018-2022, University of Colorado Boulder

/**
 * A singleton object that contains information about the published simulations. The specific information contained is
 * that which is needed by Rosetta, the PhET translation utility, to do its job. This object is populated by obtaining
 * sim metadata from the server where the simulations reside.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Liam Mulhall (PhET Interactive Simulations)
 */


// modules
const _ = require( 'lodash' ); // eslint-disable-line
const axios = require( 'axios' );
const winston = require( 'winston' );

// constants
const CACHED_DATA_VALID_TIME = 1800; // This is 1.8 seconds in milliseconds.
const PRODUCTION_SERVER_URL = global.config.productionServerURL;
const METADATA_URL = `${PRODUCTION_SERVER_URL}/services/metadata/1.3/simulations?format=json&type=html&include-unpublished=true&summary`;
const METADATA_REQUEST_OPTIONS = {
  auth: {
    username: 'token',
    password: global.config.serverToken
  }
};

//===========================================================================//
// Set up variables for later use.                                           //
//===========================================================================//

// Timestamp when the sim info was last updated. Used to determine whether to use cached data.
let timeOfLastUpdate = 0;

// Populated by obtaining metadata from the PhET website. Used as a cache. Updated when needed.
const simInfoObject = {};

// Outstanding promise for getting metadata. Used to avoid creating duplicate requests if one is already in progress.
let inProgressMetadataPromise = null;

//===========================================================================//
// Set up main functions for metadata retrieval and update.                  //
//===========================================================================//

// Update the local copy of the sim metadata (the sim info).
async function updateSimInfo() {

  // Get metadata.
  let simMetadata = {};
  try {
    const simMetadataResponse = await axios.get( METADATA_URL, METADATA_REQUEST_OPTIONS );
    simMetadata = simMetadataResponse.data;
    winston.debug( 'Metadata successfully retrieved!' );
  }
  catch( error ) {
    const getSimMetadataError = new Error( `Unable to get sim metadata. Error: ${error.message}` );
    winston.error( getSimMetadataError.message );
    throw getSimMetadataError;
  }

  // If any part of simMetadata is undefined, throw an error. Otherwise, update sim info.
  if ( !simMetadata ) {
    const noSimMetadataError = new Error( 'Unable to obtain simMetadata. Sim info not updated.' );
    winston.error( noSimMetadataError.message );
    throw noSimMetadataError;
  }
  else if ( !simMetadata.projects ) {
    const noProjectsError = new Error( 'Unable to obtain simMetadata.projects. Sim info not updated.' );
    winston.error( noProjectsError.message );
    throw noProjectsError;
  }
  else {

    // Extract subset of metadata needed by the translation utility and save it in the sim info object.
    simMetadata.projects.forEach( projectInfo => {
      projectInfo.simulations.forEach( simulationInfo => {
        const simName = simulationInfo.name;
        const translationLocales = [];
        let englishTitle = '';

        // Make a list of the translated locales for this sim and grab the English title.
        for ( const [ locale, value ] of Object.entries( simulationInfo.localizedSimulations ) ) {
          translationLocales.push( locale );
          if ( locale === 'en' ) {
            englishTitle = value.title;
          }
        }

        // Populate the simulation information object for this simulation.  This contains the information needed by the
        // translation utility and nothing else.
        simInfoObject[ simName ] = {
          englishTitle: englishTitle,
          simUrl: `${PRODUCTION_SERVER_URL}/sims/html/${simName}/latest/${simName}_en.html`,
          translationLocales: translationLocales,
          visible: simulationInfo.visible,
          isPrototype: simulationInfo.isPrototype,
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
      const promiseFailedError = new Error( `Promise returned by updateSimInfo failed (secondary await path). ${error.message}` );
      winston.error( promiseFailedError.message );

      // Clear out the promise for the next attempt.
      inProgressMetadataPromise = null;

      throw promiseFailedError;
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
      const promiseFailedError = new Error( `Promise returned by updateSimInfo failed. ${error.message}` );
      winston.error( promiseFailedError.message );

      // Clear out the promise for the next attempt.
      inProgressMetadataPromise = null;

      throw promiseFailedError;
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
  .catch( error => winston.error( `Initial population of simInfoObject failed. ${error.message}` ) );

//===========================================================================//
// Export singleton object.                                                  //
//===========================================================================//

module.exports = {

  /**
   * Get a list of the HTML5 sims that are available on the PhET website.
   *
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
        if ( !simInfoObject[ sim ].visible && !simInfoObject[ sim ].isPrototype ) {
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
   *
   * @param {boolean} includeUnpublished
   * @returns {Promise.<Array>}
   * @public
   */
  getSimTranslationPageInfo: async function( includeUnpublished ) {
    await checkAndUpdateSimInfo();
    const simInfoArray = [];
    _.keys( simInfoObject ).forEach( projectName => {
      if ( simInfoObject[ projectName ].visible || simInfoObject[ projectName ].isPrototype || includeUnpublished ) {
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
   *
   * @param {string} simName
   * @returns {Promise.<string|null>}
   * @public
   */
  getLiveSimUrl: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( `sim not found in metadata, simName = ${simName}` );
      return null;
    }
    return simInfoObject[ simName ].simUrl;
  },

  /**
   * Get the English translation of the title for the specified simulation.
   *
   * @param {string} simName
   * @returns {Promise.<string>}
   * @public
   */
  getEnglishTitle: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( `sim not found in metadata, simName = ${simName}` );
      return '';
    }
    return simInfoObject[ simName ].englishTitle;
  },

  /**
   * Get the latest version for a simulation.
   *
   * @param {string} simName
   * @returns {Promise.<string>}
   * @public
   */
  getLatestSimVersion: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( `sim not found in metadata, simName = ${simName}` );
      return '';
    }
    return simInfoObject[ simName ].version;
  }
};