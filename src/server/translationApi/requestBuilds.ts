// Copyright 2022, University of Colorado Boulder

/**
 * Request one or more translation builds from the PhET build server.
 *
 * @param simName - name of the home repo of the sim, e.g. build-an-atom
 * @param locale - locale to build, e.g. 'de' (Deutsch, aka German)
 * @param userID - user ID of the translator, used in the build request so that credits on the website can be updated
 * @returns A promise that resolves to a boolean indicating success or failure
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Liam Mulhall
 */

import SimVersion from '../../../../perennial-alias/js/browser-and-node/SimVersion.js';
import config from '../../common/config.js';
import getDependencies from './getDependencies.js';
import getSimPhetioMetadata from './getSimPhetioMetadata.js';
import getSimVersionObject from './getSimVersionObject.js';
import logger from './logger.js';
import { SimPhetioMetadata } from './SimMetadataTypes.js';

type BuildRequestObject = {
  api: string;
  dependencies: string;
  simName: string;
  version: string;
  locales: string[];
  servers: string[];
  brands: string[];
  translatorId: number;
  authorizationCode: string;
};

const requestBuilds = async ( simName: string,
                              locale: string,
                              userID: number ): Promise<boolean> => {

  logger.info( `initiating build requests for sim: ${simName}, locale: ${locale}` );
  const currentSimVersionObject = await getSimVersionObject( simName );
  logger.info( `latest version of the sim: ${currentSimVersionObject.string}.` );

  const buildRequestObjects: BuildRequestObject[] = [];

  // Add the build request for the phet brand version of the sim.
  buildRequestObjects.push(
    await createBuildRequestObject(
      simName,
      currentSimVersionObject.string,
      locale,
      [ 'phet' ],
      userID
    )
  );

  // Get the phet-io metadata so that we can determine which phet-io branch versions, if any, need to be included in the
  // set of build requests.
  let phetioMetadata: SimPhetioMetadata[];
  try {
    phetioMetadata = await getSimPhetioMetadata();
  }
  catch( e ) {
    logger.error( `unable to get phet-io metadata, error = ${e}` );
    phetioMetadata = [];
  }

  // Filter out metadata not relevant to the specified sim.
  const simSpecificPhetioMetadata = phetioMetadata.filter(
    ( data: SimPhetioMetadata ) => data.name === simName
  );

  for ( const metadataElement of simSpecificPhetioMetadata ) {
    if ( metadataElement.versionSuffix === 'phetio' ) {
      logger.info( `skipping build of old style -phetio branch for ${simName}` );
      continue;
    }

    if (
      currentSimVersionObject.major === metadataElement.versionMajor &&
      currentSimVersionObject.minor === metadataElement.versionMinor &&
      currentSimVersionObject.dev === metadataElement.versionMaintenance
    ) {
      buildRequestObjects[ 0 ].brands.push( 'phet-io' );
    }
    else {
      const simVersion = new SimVersion(
        metadataElement.versionMajor,
        metadataElement.versionMinor,
        metadataElement.versionMaintenance
      );

      buildRequestObjects.push(
        await createBuildRequestObject(
          simName,
          simVersion.toString(),
          locale,
          [ 'phet-io' ],
          userID
        )
      );
    }
  }

  buildRequestObjects.forEach( ( bro, index ) => {
    logger.info( `build request object ${index + 1} of ${buildRequestObjects.length}:` );
    for ( const key in bro ) {
      if ( key !== 'authorizationCode' && key !== 'dependencies' ) {
        logger.info( `  ${key}: ${JSON.stringify( bro[ key as keyof BuildRequestObject ] )}` );
      }
    }
  } );

  let numberOfSuccessfulBuildRequests = 0;

  if ( config.SEND_BUILD_REQUESTS ) {
    const url = `${config.SERVER_URL}/deploy-html-simulation`;
    logger.info( `starting to send build requests to ${url}` );

    for ( const bro of buildRequestObjects ) {
      logger.info(
        `sending build request ${buildRequestObjects.indexOf( bro ) + 1} of ${
          buildRequestObjects.length
        }`
      );

      try {
        const buildRequestRes = await fetch( url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify( bro )
        } );

        logger.info( `build request status: ${buildRequestRes.status}` );
        if (
          buildRequestRes.status &&
          buildRequestRes.status >= 200 &&
          buildRequestRes.status < 300
        ) {
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

  return numberOfSuccessfulBuildRequests === buildRequestObjects.length;
};

const createBuildRequestObject = async ( simName: string,
                                         versionString: string,
                                         locale: string,
                                         brands: string[],
                                         userID: number ): Promise<BuildRequestObject> => {

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
    authorizationCode: config.BUILD_SERVER_AUTH
  };
};

export default requestBuilds;