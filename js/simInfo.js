// Copyright 2018, University of Colorado Boulder

/**
 * A singleton object that contains information about the published simulations.  The specific information contained is
 * that which is needed by Rosetta, the PhET translation utility, to do its job.
 * @author John Blanco
 */

/* eslint-env node */
'use strict';

// imports
const request = require( 'request' );
const RosettaConstants = require( './RosettaConstants' );
const winston = require( 'winston' );
const _ = require( 'underscore' ); // eslint-disable-line

// constants
const CACHED_DATA_VALID_TIME = 1800; // in seconds

// timestamp when the sim info was last updated, used to determine whether to use cached data
let timeOfLastUpdate = 0;

// sim info object - populated by obtaining metadata from the PhET website, used as a cache, updated when needed
const simInfoObject = {};

// outstanding promise for getting metadata, used to avoid creating duplicate requests if once is already in progress
let inProgressMetadataPromise = null;

// function that updates the local copy of the sim info by retrieving and interpreting metadata from the PhET site
async function updateSimInfo() {
  console.log( 'updateSimInfo called' );
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
    winston.error( 'metadata retrieval  failed, err = ' + err );
    return Promise.reject( err );
    // TODO: test this, make sure it's really what I want to do
  }

  if ( !simMetadata || !simMetadata.projects ) {
    winston.error( 'unable to obtain metadata, sim info not updated' );
  }
  else {
    simMetadata.projects.forEach( projectInfo => {
      projectInfo.simulations.forEach( simInfo => {
        const simName = simInfo.name;
        const translationLocales = [];
        let englishTitle = '';
        simInfo.localizedSimulations.forEach( localizedSimInfo => {
          translationLocales.push( localizedSimInfo.locale );
          if ( localizedSimInfo.locale === 'en' ) {
            englishTitle = localizedSimInfo.title;
          }
        } );

        simInfoObject[ simName ] = {
          englishTitle: englishTitle,
          publishedSimUrl: RosettaConstants.PRODUCTION_SERVER_URL + '/sims/html/' + simName + '/latest/' + simName + '_en.html',
          translationLocales: translationLocales
        };
      } );
    } );
    timeOfLastUpdate = Date.now();
  }
}

// function that updates cached data if it is time to do so
async function checkAndUpdateSimInfo() {

  // if a request is already in progress, return that promise
  if ( inProgressMetadataPromise ) {
    winston.info( 'a request for metadata is in progress, waiting on that promise' );
    await inProgressMetadataPromise;
  }
  else if ( (Date.now() - timeOfLastUpdate) / 1000 > CACHED_DATA_VALID_TIME ) {
    winston.info( 'sim info data was stale, initiating a new request' );
    inProgressMetadataPromise = updateSimInfo();
    await inProgressMetadataPromise;
    inProgressMetadataPromise = null; // clear out the promise when it's done
  }
  else {
    winston.info( 'using cached sim info' );
  }
}

// kick off the initial population of the sim data
checkAndUpdateSimInfo()
  .then( () => { winston.info( 'initial population of simInfo object complete' ); } )
  .catch( ( err ) => winston.info( 'initial population of simInfo object failed, err = ' + err ) );

// exported singleton object
module.exports = {

  getListOfSimNames: async function( includeUnpublished ) {
    await checkAndUpdateSimInfo();
    // TBD - exclude unpublished sims once that information is available
    return _.keys( simInfoObject );
  },

  /**
   * Get an array of objects where each object contains the project-name, title, and published URL of the simulations
   * that are available on the website.  The format is that which is needed to render the main translation selection
   * page, and is a bit historic, if background is needed please see https://github.com/phetsims/rosetta/issues/123.
   * @param {boolean} includeUnpublished
   * @return {Promise<Object>}
   * @public
   */
  getSimTranslationPageInfo: async function( includeUnpublished ) {
    await checkAndUpdateSimInfo();
    const simInfoArray = [];
    // TBD - exclude unpublished sims once that information is available
    _.keys( simInfoObject ).forEach( projectName => {
      simInfoArray.push( {
        projectName: projectName,
        simTitle: simInfoObject[ projectName ].englishTitle,
        testUrl: simInfoObject[ projectName ].publishedSimUrl
      } );
    } );
    return simInfoArray;
  },

  getLiveSimUrl: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
    }
    return simInfoObject[ simName ].publishedSimUrl;
  },

  getEnglishTitle: async function( simName ) {
    await checkAndUpdateSimInfo();
    if ( !simInfoObject[ simName ] ) {
      winston.error( 'sim not found in metadata, simName = ' + simName );
    }
    return simInfoObject[ simName ].englishTitle;
  }
};

