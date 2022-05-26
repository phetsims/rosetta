// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that gets metadata for all the sims.
 *
 * @author Liam Mulhall
 */

import axios from 'axios';
import config from './config.js';
import logger from './logger.js';

// where we get the metadata
const METADATA_URL = config.SERVER_URL +
                     '/services/metadata/1.3/simulations?format=json&type=html&include-unpublished=true&summary';

// the authorization object we must provide in the request
const METADATA_REQ_OPTIONS = {
  auth: {
    username: 'token',
    password: config.SERVER_TOKEN
  }
};

/**
 * Return the sim metadata object.
 *
 * @returns {Promise<Object>} - sim metadata
 */
const getSimMetadata = async () => {
  logger.info( 'getting sim metadata' );
  let simMetadata;
  try {
    const simMetadataRes = await axios.get( METADATA_URL, METADATA_REQ_OPTIONS );
    simMetadata = simMetadataRes.data;
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( 'got sim metadata; returning it' );
  return simMetadata;
};

export default getSimMetadata;