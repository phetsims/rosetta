// Copyright 2021, University of Colorado Boulder

import axios from 'axios';
import config from './config.js';
import logger from './logger.js';

const METADATA_URL = config.SERVER_URL +
                     '/services/metadata/1.2/simulations?format=json&type=html&include-unpublished=true&summary';
const METADATA_REQ_OPTIONS = {
  auth: {
    username: 'token',
    password: config.SERVER_TOKEN
  }
};

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