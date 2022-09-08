// Copyright 2020-2022, University of Colorado Boulder

/**
 * Submits a request to the build server to build and deploy a translation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Liam Mulhall (PhET Interactive Simulations)
 */


// modules
const axios = require( 'axios' );
const simData = require( './simData' );
const winston = require( 'winston' );
const SimVersion = require( '../../perennial/js/common/SimVersion' );
const simPhetioMetadata = require( '../../perennial/js/common/simPhetioMetadata' );

// constants
const PRODUCTION_SERVER_URL = global.config.productionServerURL;
const SEND_BUILD_REQUESTS = global.config.sendBuildRequests === undefined ? true : global.config.sendBuildRequests;

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
  try {
    const dependencies = await axios.get( url );
    const dependenciesJsonObject = dependencies.data;
    return JSON.stringify( dependenciesJsonObject );
  }
  catch( error ) {
    const errorMessage = `Unable to get dependencies for sim: ${simName}, version: ${version}. ${error.message}`;
    winston.error( errorMessage );
    throw new Error( errorMessage );
  }
}

/**
 * @param {string} simName
 * @param {number} userID
 * @param {string} locale
 * @returns {Promise.<boolean>} - true or false depending on whether the build was sent
 */
async function requestBuild( simName, locale, userID ) {

  winston.info( `Initiating build request for sim: ${simName}, locale: ${locale}.` );
  const latestVersionOfSim = await simData.getLatestSimVersion( simName );

  winston.info( `Latest version of the sim: ${latestVersionOfSim}.` );
  const dependencies = await getDependencies( simName, latestVersionOfSim );

  const simVersionObject = SimVersion.parse( latestVersionOfSim );

  // See if there is a published phet-io version of the sim we are requesting a build for. If so, add the phet-io brand
  // to the list of brands we are requesting to build. For the history of this, see:
  // https://github.com/phetsims/phet-io/issues/1874.
  const phetioSims = await simPhetioMetadata( { active: true, latest: true } );
  const brands = [ 'phet' ];
  for ( let i = 0; i < phetioSims.length; i++ ) {
    const phetioSim = phetioSims[ i ];
    const phetioSimVersion = new SimVersion( phetioSim.versionMajor, phetioSim.versionMinor, phetioSim.versionMaintenance );
    const nameAndVersionAreSame = phetioSim.name === simName && phetioSimVersion.compareNumber( simVersionObject ) === 0;
    if ( nameAndVersionAreSame ) {
      brands.push( 'phet-io' );
    }
  }

  const requestObject = {
    api: '2.0',
    dependencies: dependencies,
    simName: simName,
    version: latestVersionOfSim,
    locales: [ locale ],
    servers: [ 'production' ],
    brands: brands,
    translatorId: userID,
    authorizationCode: global.config.buildServerAuthorizationCode
  };

  // If the sendBuildRequests flag is set to true in the user's rosettaConfig.json, send it! Otherwise, don't send the
  // build request. Do, however, log the theoretical build request for debugging purposes.
  if ( SEND_BUILD_REQUESTS ) {

    // Tell the user where we're sending the build request.
    const url = `${PRODUCTION_SERVER_URL}/deploy-html-simulation`;
    winston.info( `Sending build request to server. URL: ${url}` );

    // Try to send the build request.
    let buildRequestRes = null;
    try {
      buildRequestRes = await axios.post( url, requestObject );
    }
    catch( error ) {
      const errorMessage = `Build request unsuccessful. ${error.message}`;
      winston.error( errorMessage );
      throw new Error( errorMessage );
    }

    // return the build request response
    return buildRequestRes;
  }
  else {
    winston.info( 'The sendBuildRequest flag is set to false in your rosettaConfig.json! Not sending the build request.' );
    winston.debug( 'You can find the theoretical requestObject below.' );
    winston.debug( JSON.stringify( requestObject, null, 2 ) );
    throw new Error( 'Build request unsuccessful. sendBuildRequest = false in rosettaConfig.json.' );
  }
}

module.exports = requestBuild;