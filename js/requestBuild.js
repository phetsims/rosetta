// Copyright 2020, University of Colorado Boulder

/**
 * Submit a request to the build server to build and deploy a translation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

'use strict';

// modules
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const RosettaConstants = require( './RosettaConstants' );
const simData = require( './simData' );
const winston = require( 'winston' );

// constants
const PRODUCTION_SERVER_URL = RosettaConstants.PRODUCTION_SERVER_URL;

/**
 * @param {string} simName
 * @param {number} userID
 * @param {string} locale
 * @returns {Promise<boolean>}
 */
module.exports = async function( simName, userID, locale ) {

  winston.info( 'initiating build request for sim = ' + simName + ', locale = ' + locale );
  const latestVersionOfSim = await simData.getLatestSimVersion( simName );
  winston.info( 'latest sim version = ' + latestVersionOfSim );
  const dependencies = await getDependencies( simName, latestVersionOfSim );
  const requestObject = {
    api: '2.0',
    dependencies: dependencies,
    simName: simName,
    version: latestVersionOfSim,
    locales: [ locale ],
    servers: [ 'production' ],
    brands: [ 'phet' ],
    translatorId: userID,
    authorizationCode: global.config.buildServerAuthorizationCode
  };

  const url = PRODUCTION_SERVER_URL + '/deploy-html-simulation';
  winston.info( 'sending build request to server, URL = ' + url );

  // send off the request, and return the resulting promise
  const buildRequestResponse = await nodeFetch( url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify( requestObject )
  } );
  if ( buildRequestResponse.status === 200 || buildRequestResponse.status === 202 ) {
    winston.info( 'build request accepted, status = ' + buildRequestResponse.status );
    return true;
  }
  else if ( buildRequestResponse.status === 400 ) {
    throw new Error( 'build request unsuccessful, probably due to missing info, status = ' + buildRequestResponse.status );
  }
  else if ( buildRequestResponse.status === 401 ) {
    throw new Error( 'build request unsuccessful, probably due to bad auth code, status = ' + buildRequestResponse.status );
  }
  else {
    throw new Error( 'build request unsuccessful, status = ' + buildRequestResponse.status );
  }
};

/**
 * Get the dependencies for the specified simulation and version
 * @param {string} simName
 * @param {string} version
 * @returns {Promise.<string>} - JSON data with dependencies
 */
async function getDependencies( simName, version ) {

  // compose the URL where the dependencies should be
  const url = PRODUCTION_SERVER_URL +
              '/sims/html/' +
              simName +
              '/' +
              version +
              '/dependencies.json';

  // get the dependencies
  winston.info( 'fetching dependencies from ' + url );
  const response = await nodeFetch( url );

  // return the results or throw an error
  if ( response.status === 200 ) {
    return await response.text();
  }
  else {
    throw new Error( 'unable to get dependencies for sim ' + simName + ', version ' + version + '; response.status = ' + response.status );
  }
}