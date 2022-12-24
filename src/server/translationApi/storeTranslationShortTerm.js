// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in short-term storage.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import privateConfig from '../../common/privateConfig.js';
import deleteSavedTranslation from './deleteSavedTranslation.js';
import { shortTermStringStorageCollection } from './getShortTermStringStorageCollection.js';
import logger from './logger.js';

/**
 * Save a translation to the short-term storage database. We store the translation without reformatting the data. We
 * simply take the translation received from the client and save it in the short-term storage database.
 *
 * @param translation - translation received from client
 */
const storeTranslationShortTerm = async translation => {
  let stored = false;
  if ( privateConfig.DB_ENABLED ) {
    logger.info( `storing ${translation.locale}/${translation.simName} translation in short-term storage` );
    try {

      // Try to delete a translation with the same user ID, sim name, and locale.
      // It's possible there won't be a saved translation; that's fine.
      await deleteSavedTranslation( {
        userId: translation.userId,
        simName: translation.simName,
        locale: translation.locale
      } );
      logger.info( 'inserting new translation' );
      const result = await shortTermStringStorageCollection.insertOne( translation );
      logger.info( `inserted translation with id ${result.insertedId}` );
      stored = result.acknowledged;
    }
    catch( e ) {
      logger.error( e );
    }
    logger.info( `stored ${translation.locale}/${translation.simName} translation in short-term storage` );
  }
  else {
    logger.warn( 'short-term string storage database not enabled; check your config' );
  }
  return stored;
};

export default storeTranslationShortTerm;