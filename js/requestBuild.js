// Copyright 2020, University of Colorado Boulder

/**
 * Submits a request to the build server to build and deploy a translation.
 *
 * @author John Blanco
 * @author Liam Mulhall
 */

'use strict';

// modules
const nodeFetch = require( 'node-fetch' ); // eslint-disable-line
const simData = require( './simData' );
const winston = require( 'winston' );

// constants
const PRODUCTION_SERVER_URL = global.config.productionServerURL;

/**
 * Get the dependencies for the specified simulation and version.
 *
 * @param {string} simName
 * @param {string} version
 * @returns {Promise.<string>} - JSON data with dependencies
 */
async function getDependencies( simName, version ) {

  // Compose the URL where the dependencies should be.
  const url = `${PRODUCTION_SERVER_URL}/sims/html/${simName}/${version}/dependencies.json`;

  // Get the dependencies.
  winston.info( `Fetching dependencies from ${url}` );
  const response = await nodeFetch( url );

  // Return the results or throw an error.
  if ( response.status === 200 ) {
    return await response.text();
  }
  else {
    throw new Error( `Unable to get dependencies for sim: ${simName}, version: ${version}. Status: ${response.status}` );
  }
}

/**
 * @param {string} simName
 * @param {number} userID
 * @param {string} locale
 * @returns {Promise<boolean>}
 */
async function requestBuild( simName, locale, userID ) {

  winston.info( `Initiating build request for sim: ${simName}, locale: ${locale}.` );
  const latestVersionOfSim = await simData.getLatestSimVersion( simName );
  winston.info( `Latest version of the sim: ${latestVersionOfSim}.` );
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
  winston.info( `Sending build request to server. URL: ${url}` );

  // Send off the request and return the resulting promise.
  const buildRequestResponse = await nodeFetch( url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify( requestObject )
  } );
  if ( buildRequestResponse.status === 200 || buildRequestResponse.status === 202 ) {
    winston.info( `Build request accepted. Status: ${buildRequestResponse.status}` );
    return true;
  }
  else if ( buildRequestResponse.status === 400 ) {
    throw new Error( `Build request unsuccessful. Probably due to missing info. Status: ${buildRequestResponse.status}` );
  }
  else if ( buildRequestResponse.status === 401 ) {
    throw new Error( `Build request unsuccessful. Probably due to bad authorization code. Status: ${buildRequestResponse.status}` );
  }
  else {
    throw new Error( `Build request unsuccessful. Status: ${buildRequestResponse.status}` );
  }
}

module.exports = requestBuild;