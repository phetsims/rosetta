// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets metadata for all the sims. We cache the sim metadata. We update it when it's stale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

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

// Several of the React components rely on sim metadata in order to render. Thus,
// it is possible for a "burst" of sim metadata requests to be made. Initially,
// sim metadata isn't cached in Rosetta's memory. It's a large object, so it
// takes a non-trivial amount of time to get — maybe 2-3 seconds. Since we
// are busting the website's sim metadata cache each time we make a request,
// a burst of requests could tax the server. Thus, we want to have a way to say:
// "If we've already sent out a request for sim metadata, wait until it's done before
// you make any more sim metadata requests." You might be thinking, "Wait, isn't that
// what async/await is for?" Sort of. If we await the sim metadata, the n separate
// requests are made prior to caching the sim metadata. When we use this mutex pattern
// (which is sort of a hacky way to have a mutex in JavaScript), we are able to wait
// for the first request for the sim metadata to complete before the subsequent requests
// are made. Thus, we only make one request to the website, and the subsequent calls for
// sim metadata hit Rosetta's cached sim metadata. I (Liam Mulhall) read about this
// pattern in https://www.nodejsdesignpatterns.com/blog/node-js-race-conditions/.
//
// Here's the author's explanation of the pattern:
// "We initialize our mutex as an instance of a resolved promise. Every time we are
// invoking the function doingSomethingCritical() we are effectively 'queueing' the
// execution of the code on the critical path using mutex.then(). If this is the first
// call, our initial instance of the mutex promise is a resolved promise, so the code
// on the critical path will be executed straight away on the next cycle of the event
// loop."
//
// For the history of this, see https://github.com/phetsims/rosetta/issues/351.
let simMetadataMutex = Promise.resolve();

let simMetadata;

/**
 * Return the sim metadata object. Update it if it is stale, otherwise used cached sim metadata.
 *
 * @returns {Promise<Object> | Object} - sim metadata
 */
const getSimMetadata = async () => {
  logger.info( 'getting sim metadata' );

  simMetadataMutex = simMetadataMutex.then( async () => {

    const metadataValidDurationElapsed = timeOfLastUpdate +
                                         publicConfig.VALID_METADATA_DURATION < Date.now();

    // We use cached sim metadata unless the sim metadata has become stale (i.e. the valid metadata duration has
    // elapsed). If there's an existing promise for the sim metadata, we don't enter this block.
    if ( metadataValidDurationElapsed ) {
      logger.info( 'sim metadata is stale or nonexistent; getting it' );

      // To reduce the amount of time our translators will have to see a note about
      // a sim having a pending update for its status as published or unpublished, we
      // bust the website's cache of sim metadata. For more info on this, see
      // https://github.com/phetsims/rosetta/issues/351.
      const cacheBustingQueryParam = '&nonce=' +
                                     makePseudoRandomString( PSEUDO_RANDOM_STRING_LENGTH );
      const cacheBustingSimMetadataUrl = METADATA_URL + cacheBustingQueryParam;
      logger.info( `cache-busting sim metadata url: ${cacheBustingSimMetadataUrl}` );

      const simMetadataRes = await axios.get(
        METADATA_URL + cacheBustingQueryParam,
        METADATA_REQ_OPTIONS
      );
      logger.info( 'got sim metadata; setting its value' );
      simMetadata = simMetadataRes.data;

      // Uncomment this code if you want a local copy of sim metadata.
      // fs.writeFileSync( './simMetadata.json', JSON.stringify( simMetadata, null, 4 ) );

      // We ignore this ESLint rule because a race condition here won't be problematic.
      // eslint-disable-next-line require-atomic-updates
      timeOfLastUpdate = Date.now();
    }
    else {
      logger.info( 'using cached sim metadata' );
    }

    logger.info( 'returning sim metadata' );
    return simMetadata;
  } ).catch( e => {
    logger.error( e );
    simMetadata = { error: 'unable to get sim metadata' };
  } );
  logger.info( 'returning sim metadata mutex' );

  return simMetadataMutex;
};

export default getSimMetadata;