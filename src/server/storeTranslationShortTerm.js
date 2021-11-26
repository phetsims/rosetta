// Copyright 2021, University of Colorado Boulder

import config from './config.js';
import logger from './logger.js';
import { MongoClient } from 'mongodb';

const client = new MongoClient( config.DB_URI );
const storeTranslationShortTerm = async translation => {
  logger.info( `storing ${translation.locale}/${translation.sim} translation in short-term storage` );
  try {
    await client.connect();
    const database = client.db( config.DB_NAME );
    const shortTermStringStorageCollection = database.collection( config.DB_SHORT_TERM_STORAGE_COLLECTION_NAME );
    const oldSavedTranslation = await shortTermStringStorageCollection.find( { userId: translation.userId } );
    if ( oldSavedTranslation ) {
      logger.info( `old saved ${translation.locale}/${translation.sim} translation(s) with same user id extant; deleting them` );
      await shortTermStringStorageCollection.deleteMany( { userId: translation.userId } );
    }
    logger.info( 'inserting new translation' );
    await shortTermStringStorageCollection.insertOne( translation );
  }
  catch( e ) {
    logger.error( e );
  }
  finally {
    await client.close();
  }
  logger.info( `stored ${translation.locale}/${translation.sim} translation in short-term storage` );
};

export { storeTranslationShortTerm as default };