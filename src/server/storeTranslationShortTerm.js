// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in short-term storage.
 *
 * @author Liam Mulhall
 */

import config from './config.js';
import logger from './logger.js';
import { MongoClient } from 'mongodb';

const client = new MongoClient( config.DB_URI );

/**
 * Save a translation to the short-term storage database. We store the translation without reformatting the data. We
 * simply take the translation received from the client and save it in the short-term storage database.
 *
 * @param translation - translation received from client
 */
const storeTranslationShortTerm = async translation => {
  logger.info( `storing ${translation.locale}/${translation.simName} translation in short-term storage` );
  try {
    await client.connect();
    const database = client.db( config.DB_NAME );
    const shortTermStringStorageCollection = database.collection( config.DB_SHORT_TERM_STORAGE_COLLECTION_NAME );
    const filter = {
      userId: translation.userId,
      simName: translation.simName,
      locale: translation.locale
    };
    const oldSavedTranslation = await shortTermStringStorageCollection.find( filter );
    if ( oldSavedTranslation ) {
      logger.info( `old saved ${translation.locale}/${translation.simName} translation(s) with same user id extant; deleting them` );
      await shortTermStringStorageCollection.deleteMany( filter );
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
  logger.info( `stored ${translation.locale}/${translation.simName} translation in short-term storage` );
};

export default storeTranslationShortTerm;