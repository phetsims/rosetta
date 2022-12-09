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
  const phetioMetadata = await simPhetioMetadata( { active: true, latest: true } );
  const brands = [ 'phet' ];
  for ( let i = 0; i < phetioMetadata.length; i++ ) {
    const phetioSimMetadata = phetioMetadata[ i ];
    const phetioSimVersion = new SimVersion(
      phetioSimMetadata.versionMajor,
      phetioSimMetadata.versionMinor,
      phetioSimMetadata.versionMaintenance
    );
    const nameAndVersionAreSame = phetioSimMetadata.name === simName &&
                                  phetioSimVersion.major === simVersionObject.major &&
                                  phetioSimVersion.minor === simVersionObject.minor;


    // If the conditions are right, add phet-io to the brands in the build request.
    if ( nameAndVersionAreSame ) {

      // It is possible - and has occurred - for the version number of the published phet brand sim to match that of a
      // previously published phet-io sim that came from a separate branch.  In this case, we DON'T want to request the
      // phet-io version in the build, since doing so would cause the build server will overwrite the published phet-io
      // version with the phet brand version.  See https://github.com/phetsims/rosetta/issues/322.
      const phetioVersionFromSeparateBranch = phetioSimMetadata.versionSuffix !== undefined &&
                                              phetioSimMetadata.versionSuffix === 'phetio';

      if ( !phetioVersionFromSeparateBranch ) {

        // Add phet-io to the list of brands that will be built.
        brands.push( 'phet-io' );
      }
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

  // Log the build request without the auth code or dependencies.
  const keysForLog = Object.keys( requestObject ).filter( key => key !== 'authorizationCode' && key !== 'dependencies' );
  winston.info( 'Build request object:' );
  for ( const key of keysForLog ) {
    winston.info( `    ${key}: ${requestObject[ key ]}` );
  }

  // If the sendBuildRequests flag is set to true in the user's rosettaConfig.json, send it! Otherwise, don't send the
  // build request. Do, however, log the theoretical build request for debugging purposes.
  let buildRequestRes = false;
  if ( SEND_BUILD_REQUESTS ) {

    // Tell the user where we're sending the build request.
    const url = `${PRODUCTION_SERVER_URL}/deploy-html-simulation`;
    winston.info( `Sending build request to server. URL: ${url}` );

    // Try to send the build request.
    try {
      buildRequestRes = await axios.post( url, requestObject );
    }
    catch( error ) {
      const errorMessage = `Build request unsuccessful. ${error.message}`;
      winston.error( errorMessage );
      throw new Error( errorMessage );
    }
  }
  else {
    winston.warn( 'The sendBuildRequest flag is set to false in config, not sending the build request.' );
  }
  return buildRequestRes;
}

module.exports = requestBuild;