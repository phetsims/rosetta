// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that stores a translation in short-term storage.
 *
 * @author Liam Mulhall
 */

import config from './config.js';
import deleteSavedTranslation from './deleteSavedTranslation.js';
import logger from './logger.js';
import { shortTermStringStorageCollection } from './getShortTermStringStorageCollection.js';

/**
 * Save a translation to the short-term storage database. We store the translation without reformatting the data. We
 * simply take the translation received from the client and save it in the short-term storage database.
 *
 * @param translation - translation received from client
 */
const storeTranslationShortTerm = async translation => {
  if ( config.DB_ENABLED === 'true' ) {
    logger.info( `storing ${translation.locale}/${translation.simName} translation in short-term storage` );
    try {
      await deleteSavedTranslation( {
        userId: translation.userId,
        simName: translation.simName,
        locale: translation.locale
      } );
      logger.info( 'inserting new translation' );
      await shortTermStringStorageCollection.insertOne( translation );
    }
    catch( e ) {
      logger.error( e );
    }
    logger.info( `stored ${translation.locale}/${translation.simName} translation in short-term storage` );
  }
  else {
    logger.warn( 'short-term string storage database not enabled; check your config' );
  }
};

export default storeTranslationShortTerm;