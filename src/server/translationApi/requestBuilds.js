// Copyright 2022, University of Colorado Boulder

/**
 * Request one or more translation builds from the PhET build server.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 * @author John Blanco (PhET Interactive Simulations)
 */

import axios from 'axios';
import simPhetioMetadata from '../../../../perennial/js/common/simPhetioMetadata.js';
import SimVersion from '../../../../perennial/js/browser-and-node/SimVersion.js';
import privateConfig from '../../common/privateConfig.js';
import getDependencies from './getDependencies.js';
import getSimVersionObject from './getSimVersionObject.js';
import logger from './logger.js';

/**
 * Send the requests to the PhET build server that are necessary to build all currently active phet and phet-io brand
 * versions of the specified sim for the provided locale.  There will generally be at least one build request sent, and
 * there can potentially be several.
 * @param {String} simName - name of the home repo of the sim, e.g. build-an-atom
 * @param {String} locale - locale to build, e.g. 'de' (Deutsch, aka German)
 * @param {Number} userID - user ID of the translator, used in the build request so that credits on the website can be
 *                          updated
 * @returns {Promise.<boolean>} - true or false depending on whether all requests to the build server succeeded
 */
const requestBuilds = async ( simName, locale, userID ) => {

  logger.info( `initiating build requests for sim: ${simName}, locale: ${locale}` );
  const currentSimVersionObject = await getSimVersionObject( simName );
  logger.info( `latest version of the sim: ${currentSimVersionObject.string}.` );

  const buildRequestObjects = [];

  // Add the build request for the phet brand version of the sim.
  buildRequestObjects.push( await createBuildRequestObject(
    simName,
    currentSimVersionObject.string,
    locale,
    [ 'phet' ],
    userID
  ) );

  // Get the phet-io metadata so that we can determine which phet-io branch versions, if any, need to be included in the
  // set of build requests.
  let phetioMetadata = [];
  try {
    phetioMetadata = await simPhetioMetadata( { active: true, latest: true } );
  }
  catch( e ) {
    logger.error( `unable to get phet-io metadata, error = ${e}` );
  }

  // Filter out metadata not relevant to the specified sim.
  const simSpecificPhetioMetadata = phetioMetadata.filter( data => data.name === simName );

  for ( const metadataElement of simSpecificPhetioMetadata ) {

    if ( metadataElement.versionSuffix === 'phetio' ) {

      // Previous phetio brand versions that were published on a branch with a "phetio" suffix are skipped because they
      // don't contain an all-locales file and requesting them can potentially overwrite the phet-io version when we
      // don't want to.  See https://github.com/phetsims/rosetta/issues/322.
      logger.info( `skipping build of old style -phetio branch for ${simName}` );
      continue;
    }

    // Check if the metadata version matches that of the currently published sim.  You might notice that the version
    // formats for the sim metadata is different than that used for the phet-io metadata.  This is historical.
    if ( currentSimVersionObject.major === metadataElement.versionMajor &&
         currentSimVersionObject.minor === metadataElement.versionMinor &&
         currentSimVersionObject.dev === metadataElement.versionMaintenance ) {

      // Piggyback onto the build request object for the phet brand, since it is possible to request multiple brands
      // in a single build request.
      buildRequestObjects[ 0 ].brands.push( 'phet-io' );
    }
    else {

      // This metadata element represents a previous release whose phet-io brand is still maintained and thus its
      // translations need to be updated, so add a separate build request object for it.

      const simVersion = new SimVersion(
        metadataElement.versionMajor,
        metadataElement.versionMinor,
        metadataElement.versionMaintenance
      );

      buildRequestObjects.push( await createBuildRequestObject(
        simName,
        simVersion.toString(),
        locale,
        [ 'phet-io' ],
        userID
      ) );
    }
  }

  // Log the build request objects but omit the auth codes (for security) and dependencies (to reduce noise).  This is
  // done regardless of whether Rosetta is configured to send these requests to the build server.
  buildRequestObjects.forEach( ( bro, index ) => {
    logger.info( `build request object ${index + 1} of ${buildRequestObjects.length}:` );
    for ( const key in bro ) {
      if ( key !== 'authorizationCode' && key !== 'dependencies' ) {
        logger.info( `  ${key}: ${bro[ key ]}` );
      }
    }
  } );

  let numberOfSuccessfulBuildRequests = 0;

  // If Rosetta is configured to send build requests, send them to the build sever.
  if ( privateConfig.SEND_BUILD_REQUESTS ) {

    const url = `${privateConfig.SERVER_URL}/deploy-html-simulation`;
    logger.info( `starting to send build requests to ${url}` );

    for ( const bro of buildRequestObjects ) {

      logger.info( `sending build request ${buildRequestObjects.indexOf( bro ) + 1} of ${buildRequestObjects.length}` );

      // Try to send the build request.
      try {
        const buildRequestRes = await axios.post( url, bro );
        logger.info( `build request status: ${buildRequestRes.status}` );
        if ( buildRequestRes.status
             && buildRequestRes.status >= 200
             && buildRequestRes.status < 300 ) {
          numberOfSuccessfulBuildRequests++;
        }
      }
      catch( e ) {
        logger.error( `build request error: ${e}` );
      }
    }
  }
  else {
    logger.warn( 'SEND_BUILD_REQUESTS flag is set to false; sending of build requests skipped' );
  }

  // Return a boolean indication of whether all build requests were successful.  There are two things to note about
  // this: One is that `false` will be returned when the sending of build requests is disabled, so the client code
  // should be ready to handle this.  The other is that the return value does NOT indicate whether the builds themselves
  // were successful, just that the request was sent and accepted by the build sever.
  return numberOfSuccessfulBuildRequests === buildRequestObjects.length;
};

/**
 * Internal convenience function for creating build request objects with the values needed for building translations.
 * These objects match the format needed by the PhET build server.
 * @param {string} simName
 * @param {string} versionString
 * @param {string} locale
 * @param {string[]} brands
 * @param {number} userID
 * @returns {Object}
 */
const createBuildRequestObject = async ( simName, versionString, locale, brands, userID ) => {

  // If the 'phet' brand is included in the list of brands, use the dependencies for that brand, since the dependencies
  // for all brands of a given version are identical.  If only 'phet-io' is included, get the dependencies for that
  // brand since older versions of phet-io publications may not have a corresponding 'phet' brand publication.
  const brandForDependencies = brands.includes( 'phet' ) ? 'phet' : 'phet-io';
  const dependencies = await getDependencies( simName, versionString, brandForDependencies );
  return {
    api: '2.0',
    dependencies: dependencies,
    simName: simName,
    version: versionString,
    locales: [ locale ],
    servers: [ 'production' ],
    brands: brands,
    translatorId: userID,
    authorizationCode: privateConfig.BUILD_SERVER_AUTH
  };
};

export default requestBuilds;