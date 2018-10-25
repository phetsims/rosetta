// Copyright 2018, University of Colorado Boulder

/**
 * A singleton object that contains information about the published simulations.  The specific information contained is
 * that which is needed by Rosetta, the PhET translation utility, to do its job.
 * @author John Blanco
 */

/* eslint-env node */
'use strict';

// imports
const _ = require( 'underscore' ); // eslint-disable-line
const request = require( 'request' );
const RosettaConstants = require( './RosettaConstants' );
const winston = require( 'winston' );

// constants
const CACHED_DATA_VALID_TIME = 1800; // in seconds

// timestamp when the sim info was last updated, used to determine whether to use cached data
let timeOfLastUpdate = 0;

// sim info object - populated by obtaining metadata from the PhET website, used as a cache, updated when needed
const simDataObject = {};

// outstanding promise for getting metadata, used to avoid creating duplicate requests if once is already in progress
let inProgressMetadataPromise = null;

// function that updates the local copy of the sim info by retrieving and interpreting metadata from the PhET site
async function updateSimData() {
  const url = RosettaConstants.PRODUCTION_SERVER_URL +
              '/services/metadata/1.2/simulations?format=json&type=html&include-unpublished=true&summary';

  let simMetadata;
  try {
    simMetadata = await new Promise( ( resolve, reject ) => {
      request( url, async ( error, response, body ) => {
        try {
          body = JSON.parse( body );
        }
          // the JSON object wasn't formatted right, reject
        catch( e ) {
          reject( e );
        }
        // there was some error in the request, reject
        if ( error ) {
          reject( error );
        }
        // there was an error processing the request
        else if ( body.error ) {
          reject( new Error( body.error ) );
        }
        // it's all good, resolve the promise
        else {
          resolve( body );
        }
      } ).auth( 'token', global.preferences.serverToken, true );
    } );
  }
  catch( err ) {
    winston.error( 'metadata retrieval failed, err = ' + err );
    return Promise.reject( err );
  }

  if ( !simMetadata || !simMetadata.projects ) {
    winston.error( 'unable to obtain metadata, sim info not updated' );
  }
  else {

    // extract the subset of the metadata needed by the translation utility and save it in the sim info object
    simMetadata.projects.forEach( projectInfo => {
      projectInfo.simulations.forEach( simData => {
        const simName = simData.name;
        const translationLocales = [];
        let englishTitle = '';
        simData.localizedSimulations.forEach( localizedSimData => {
          translationLocales.push( localizedSimData.locale );
          if ( localizedSimData.locale === 'en' ) {
            englishTitle = localizedSimData.title;
          }
        } );

        simDataObject[ simName ] = {
          englishTitle: englishTitle,
          simUrl: RosettaConstants.PRODUCTION_SERVER_URL + '/sims/html/' + simName + '/latest/' + simName + '_en.html',
          translationLocales: translationLocales,
          visible: simData.visible,
          version: projectInfo.version.string
        };
      } );
    } );
    timeOfLastUpdate = Date.now();
  }
}

// function that updates cached data if it is time to do so
async function checkAndUpdateSimData() {

  // if a request is already in progress, return that promise
  if ( inProgressMetadataPromise ) {
    winston.info( 'a request for metadata is in progress, waiting on that promise' );

    try {
      await inProgressMetadataPromise;
    }
    catch( error ) {
      winston.error( 'promise returned by updateSimData failed (secondary await path)' );
    }
  }
  else if ( ( Date.now() - timeOfLastUpdate ) / 1000 > CACHED_DATA_VALID_TIME ) {
    winston.info( 'sim data was stale, initiating a new request' );

    // Use the promise explicitly so that if other requests are received before this is resolved, they can also wait
    // on it.
    inProgressMetadataPromise = updateSimData();
    try {
      await inProgressMetadataPromise;
    }
    catch( error ) {

      // there really isn't much that can be done here other than to hope that the next attempt succeeds
      winston.error( 'promise returned by updateSimData failed, error = ' + error );
    }
    inProgressMetadataPromise = null; // clear out the promise for the next attempt
  }
  else {
    winston.info( 'using cached sim info' );
  }
}

// kick off the initial population of the sim data
checkAndUpdateSimData()
  .then( () => { winston.info( 'initial population of simData object complete' ); } )
  .catch( ( err ) => winston.info( 'initial population of simData object failed, err = ' + err ) );

// exported singleton object
module.exports = {

  /**
   * get a list of the HTML5 sims that are available on the PhET website
   * @param {boolean} includeUnpublished
   * @return {Promise.<Array.<string>>}
   * @public
   */
  getListOfSimNames: async function( includeUnpublished ) {

    await checkAndUpdateSimData();

    // get a list of all sims (remember that we are only working with HTML5 sims here)
    let simNames = _.keys( simDataObject );

    // Unpublished (AKA invisible) sims are present by default, so if the flag says that they should NOT be included,
    // they need to be removed.
    if ( !includeUnpublished ) {
      const simNamesToExclude = [];
      simNames.forEach( sim => {
        if ( !simDataObject[ sim ].visible ) {
          simNamesToExclude.push( sim );
        }
      } );
      simNames = _.difference( simNames, simNamesToExclude );
    }

    return simNames;
  },

  /**
   * Get an array of objects where each object contains the project-name, title, and published URL of the simulations
   * that are available on the website.  The format is that which is needed to render the main translation selection
   * page, and is a bit historic, if background is needed please see https://github.com/phetsims/rosetta/issues/123.
   * @param {boolean} includeUnpublished
   * @return {Promise.<Array>}
   * @public
   */
  getSimTranslationPageInfo: async function( includeUnpublished ) {
    await checkAndUpdateSimData();
    const simInfoArray = [];
    _.keys( simDataObject ).forEach( projectName => {
      if ( simDataObject[ projectName ].visible || includeUnpublished ) {
        simInfoArray.push( {
          projectName: projectName,
          simTitle: simDataObject[ projectName ].englishTitle,
          testUrl: simDataObject[ projectName ].simUrl
        } );
      }
    } );
    return simInfoArray;
  },

  /**
   * get the URL where the simulation is available from the website
   * @param {string} simName
   * @return {Promise.<string|null>}
   * @public
   */
  getLiveSimUrl: async function( simName ) {
    await checkAndUpdateSimData();
    if ( !simDataObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
      return null;
    }
    return simDataObject[ simName ].simUrl;
  },

  /**
   * get the English translation of the title for the specified simulation
   * @param {string} simName
   * @return {Promise.<string>}
   * @public
   */
  getEnglishTitle: async function( simName ) {
    await checkAndUpdateSimData();
    if ( !simDataObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
      return '';
    }
    return simDataObject[ simName ].englishTitle;
  },

  /**
   * Get the latest version for a simulation
   * @param {string} simName
   * @returns {Promise<string>}
   * @public
   */
  getLatestSimVersion: async function( simName ) {
    await checkAndUpdateSimData();
    if ( !simDataObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
      return '';
    }
    return simDataObject[ simName ].version;
  }
};

