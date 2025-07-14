// Copyright 2021-2022, University of Colorado Boulder

/**
 * Export a function that deletes saved translation(s) (although technically there should only ever be one) that match
 * the provided user ID, sim name, and locale.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import config from '../../common/config.js';
import { Locale, RepoName } from '../../common/TypeAliases.js';
import { shortTermStringStorageCollection } from './getShortTermStringStorageCollection.js';
import logger from './logger.js';

type IdSimNameAndLocale = {
  userId: number;
  simName: RepoName;
  locale: Locale;
};

/**
 * Delete any translations that match the provided user ID, sim name, and locale.
 *
 * @param idSimNameAndLocale - an object containing the user ID, sim name, and locale for a translation
 * @returns A promise resolving to a boolean indicating whether the deletion was successful
 */
const deleteSavedTranslation = async ( idSimNameAndLocale: IdSimNameAndLocale ): Promise<boolean> => {
  let wasDeleted = false;
  if ( config.DB_ENABLED ) {
    logger.info(
      `attempting to delete old ${idSimNameAndLocale.locale}/${idSimNameAndLocale.simName} translation(s) in short-term storage`
    );
    try {
      const oldSavedTranslation = shortTermStringStorageCollection.find( idSimNameAndLocale );
      if ( oldSavedTranslation ) {
        logger.info(
          `old saved ${idSimNameAndLocale.locale}/${idSimNameAndLocale.simName} translation(s) with same user id extant; deleting them`
        );
        const deleteResult = await shortTermStringStorageCollection.deleteMany( idSimNameAndLocale );
        wasDeleted = deleteResult.acknowledged;
      }
      else {
        logger.info( `no saved translation for ${idSimNameAndLocale.locale}/${idSimNameAndLocale.simName} found` );
      }
    }
    catch( e ) {
      logger.error( e );
    }
    logger.info(
      `done attempting to delete ${idSimNameAndLocale.locale}/${idSimNameAndLocale.simName} translation(s) in short-term storage`
    );
  }
  else {
    logger.warn( 'short-term string storage database not enabled; check your config' );
  }
  return wasDeleted;
};

export default deleteSavedTranslation;