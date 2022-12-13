// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a connection to the collection (table) of translations saved in the short-term storage database.
 *
 * @author Liam Mulhall
 */

import { MongoClient } from 'mongodb';
import privateConfig from '../../common/privateConfig.js';
import logger from './logger.js';

let shortTermStringStorageCollection = {};

if ( privateConfig.DB_ENABLED ) {

  const client = new MongoClient( privateConfig.DB_URI );

  // try to connect to mongo
  try {
    ( async () => {
      logger.info( 'establishing connection to database' );
      await client.connect();
      logger.info( 'established connection to database' );
    } )();
  }
  catch( e ) {
    logger.error( e );
  }

  // get the database
  const database = client.db( privateConfig.DB_NAME );

  // get the collection (analogous to sql table)
  shortTermStringStorageCollection = database.collection( privateConfig.DB_SHORT_TERM_STORAGE_COLLECTION_NAME );

  // close the connection to mongo
  process.on( 'exit', async () => {
    logger.info( 'closing connection to database' );
    await client.close();
    logger.info( 'closed connection to database' );
  } );
}
else {
  logger.warn( 'short-term string storage database not enabled; check your config' );
}

export { shortTermStringStorageCollection };