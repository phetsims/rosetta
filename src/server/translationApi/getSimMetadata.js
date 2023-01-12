// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets metadata for all the sims. We cache the sim metadata. We update it when it's stale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import fs from 'fs';
import axios from 'axios';
import privateConfig from '../../common/privateConfig.js';
import publicConfig from '../../common/publicConfig.js';
import logger from './logger.js';

const { randomBytes } = await import( 'node:crypto' );

const METADATA_URL = privateConfig.SERVER_URL +
                     '/services/metadata/1.3/simulations?format=json&type=html&include-unpublished=true&summary';

// The authorization object we must provide in the request.
const METADATA_REQ_OPTIONS = {
  auth: {
    username: 'token',
    password: privateConfig.SERVER_TOKEN
  }
};

// The pseudo random string is used as a query parameter to bust the website's
// sim metadata cache.
const PSEUDO_RANDOM_STRING_LENGTH = 40;

/**
 * Make a pseudo random string of characters and numbers. Used for making the nonce
 * query parameter that we use to bust the server's sim metadata cache.
 *
 * @param {Number} length
 * @returns {String}
 */
const makePseudoRandomString = length => {
  return randomBytes( length ).toString( 'hex' );
};

let timeOfLastUpdate = Number.NEGATIVE_INFINITY;

// Boolean to indicate whether there's an existing promise for sim metadata.
let simMetadataPromise = false;

let simMetadata;

/**
 * Return the sim metadata object. Update it if it is stale, otherwise used cached sim metadata.
 *
 * @returns {Promise<Object> | Object} - sim metadata
 */
const getSimMetadata = async () => {
  logger.info( 'getting sim metadata' );
  try {

    // If working on the translation utility without an internet connection,
    // mock the sim metadata with your local copy. (This assumes you have
    // a local copy of sim metadata.)
    if ( publicConfig.ENVIRONMENT === 'development' && privateConfig.NO_INTERNET ) {
      logger.info( 'using local copy of sim metadata' );
      return JSON.parse( fs.readFileSync( './simMetadata.json' ) );
    }

    const metadataValidDurationElapsed = timeOfLastUpdate +
                                         publicConfig.VALID_METADATA_DURATION < Date.now();

    // We use cached sim metadata unless the sim metadata has become stale (i.e. the valid metadata duration has
    // elapsed). If there's an existing promise for the sim metadata, we don't enter this block.
    if ( metadataValidDurationElapsed && !simMetadataPromise ) {
      logger.info( 'sim metadata is stale or nonexistent; getting it' );

      // To reduce the amount of time our translators will have to see a note about
      // a sim having a pending update for its status as published or unpublished, we
      // bust the website's cache of sim metadata. For more info on this, see
      // https://github.com/phetsims/rosetta/issues/351.
      const cacheBustingQueryParam = '&nonce=' +
                                     makePseudoRandomString( PSEUDO_RANDOM_STRING_LENGTH );
      const cacheBustingSimMetadataUrl = METADATA_URL + cacheBustingQueryParam;
      logger.info( `cache-busting sim metadata url: ${cacheBustingSimMetadataUrl}` );

      // This code actually avoids a race condition rather than creates one.
      // eslint-disable-next-line require-atomic-updates
      simMetadataPromise = await axios.get(
        METADATA_URL + cacheBustingQueryParam,
        METADATA_REQ_OPTIONS
      );
      simMetadata = simMetadataPromise.data;

      // Once we have the sim metadata, we can set the promise back to false.
      simMetadataPromise = false;

      // We ignore this ESLint rule because a race condition here won't be problematic.
      /* eslint-disable require-atomic-updates */
      timeOfLastUpdate = Date.now();
    }
    else {
      logger.info( 'using cached sim metadata' );
    }
  }
  catch( e ) {
    logger.error( e );
    simMetadata = { error: 'unable to get sim metadata' };
  }
  logger.info( 'returning sim metadata' );

  // Uncomment this code if you want a local copy of sim metadata.
  // fs.writeFileSync( './simMetadata.json', JSON.stringify( simMetadata, null, 4 ) );

  return simMetadata;
};

export default getSimMetadata;