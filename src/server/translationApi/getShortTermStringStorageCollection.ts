// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a connection to the collection (table) of translations saved in the short-term storage database.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import { Collection, MongoClient } from 'mongodb';
import config from '../../common/config.js';
import logger from './logger.js';

// Create a mock Collection object.  This is needed for when the DB is not enabled or cannot be connected to.
const mockCollection: Collection = {
  find: () => ( { toArray: async () => [] } ),
  insertOne: async () => ( { acknowledged: false, insertedId: null } ),
  deleteMany: async () => ( { acknowledged: false, deletedCount: 0 } ),
  updateOne: async () => ( { acknowledged: false, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null } )
} as unknown as Collection;

let shortTermStringStorageCollection: Collection = mockCollection;

if ( config.DB_ENABLED ) {
  const client = new MongoClient( config.DB_URI );

  try {

    // Connect to the database.
    logger.info( 'establishing connection to database' );
    await client.connect();
    logger.info( 'established connection to database' );
    const database = client.db( config.DB_NAME );
    shortTermStringStorageCollection = database.collection( config.DB_SHORT_TERM_STORAGE_COLLECTION_NAME );

    // Close the connection to the database when the process exits.
    process.on( 'exit', async () => {
      logger.info( 'closing connection to database' );
      await client.close();
      logger.info( 'closed connection to database' );
    } );
  }
  catch( e ) {
    logger.error( `error connecting to database: ${e}` );
  }
}
else {
  logger.warn( 'short-term string storage database not enabled in config' );
}

export { shortTermStringStorageCollection };