// Copyright 2022, University of Colorado Boulder

/**
 * Request a build from the build server.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

/* eslint-disable */

import axios from 'axios';
import simPhetioMetadata from '../../../../perennial/js/common/simPhetioMetadata.js';
import SimVersion from '../../../../perennial/js/common/SimVersion.js';
import privateConfig from '../../common/privateConfig.js';
import getDependencies from './getDependencies.js';
import getSimVersionObject from './getSimVersionObject.js';
import logger from './logger.js';

/**
 * Request a build from the build server for the given sim, locale, and user ID.
 *
 * @param {String} simName
 * @param {String} locale
 * @param {Number} userID
 * @returns {Promise.<boolean>} - true or false depending on whether the request to the build server succeeded
 */
const requestBuild = async ( simName, locale, userID ) => {

  logger.info( `initiating build request for sim: ${simName}, locale: ${locale}` );
  const simVersionObject = await getSimVersionObject( simName );

  logger.info( `latest version of the sim: ${simVersionObject.string}.` );
  const dependencies = await getDependencies( simName, simVersionObject.string );

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
    version: simVersionObject.string,
    locales: [ locale ],
    servers: [ 'production' ],
    brands: brands,
    translatorId: userID,
    authorizationCode: privateConfig.BUILD_SERVER_AUTH
  };

  // Log the build request without the auth code or dependencies.
  const keysForLog = Object.keys( requestObject )
    .filter( key => key !== 'authorizationCode' && key !== 'dependencies' );
  logger.info( 'build request object:' );
  for ( const key of keysForLog ) {
    logger.info( `    ${key}: ${requestObject[ key ]}` );
  }

  // If the sendBuildRequests flag is set to true in the user's rosettaConfig.json, send it! Otherwise, don't send the
  // build request. Do, however, log the theoretical build request for debugging purposes.
  let buildRequestRes = null;
  if ( privateConfig.SEND_BUILD_REQUESTS ) {

    // Tell the user where we're sending the build request.
    const url = `${privateConfig.SERVER_URL}/deploy-html-simulation`;
    logger.info( `sending build request to ${url}` );

    // Try to send the build request.
    try {
      buildRequestRes = await axios.post( url, requestObject );
      logger.info( `build request status: ${buildRequestRes.status}` );
    }
    catch( e ) {
      logger.error( `build request result: ${e}` );
    }
  }
  else {
    logger.warn( 'send build request flag is false; check your config' );
  }
  return buildRequestRes !== null
         && buildRequestRes.status
         && buildRequestRes.status >= 200
         && buildRequestRes.status < 300;
}

export default requestBuild;