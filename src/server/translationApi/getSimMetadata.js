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

const METADATA_URL = privateConfig.SERVER_URL +
                     '/services/metadata/1.3/simulations?format=json&type=html&include-unpublished=true&summary';

// The authorization object we must provide in the request.
const METADATA_REQ_OPTIONS = {
  auth: {
    username: 'token',
    password: privateConfig.SERVER_TOKEN
  }
};

let timeOfLastUpdate = Number.NEGATIVE_INFINITY;

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
    // elapsed). Note: This doesn't handle the case where two requests for sim metadata are made in quick succession.
    // If the translation utility sees a lot of use, it might make sense to handle this case.
    if ( metadataValidDurationElapsed ) {
      logger.info( 'sim metadata is stale or nonexistent; getting it' );
      const simMetadataRes = await axios.get( METADATA_URL, METADATA_REQ_OPTIONS );
      simMetadata = simMetadataRes.data;

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
  return simMetadata;
};

// Uncomment this code if you want a local copy of sim metadata.
// import fs from 'fs';
//
// ( async () => {
//   const simMetadata = await getSimMetadata();
//   fs.writeFileSync( './simMetadata.json', JSON.stringify( simMetadata, null, 4 ) );
// } )();

export default getSimMetadata;