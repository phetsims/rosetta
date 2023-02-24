// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for submit translation API route.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import deleteSavedTranslation from '../deleteSavedTranslation.js';
import logger from '../logger.js';
import prepareTranslationForLongTermStorage from '../prepareTranslationForLongTermStorage.js';
import requestBuild from '../requestBuild.js';
import storeTranslationLongTerm from '../storeTranslationLongTerm.js';
import { reportObjectCache } from '../translationApi.js';

/**
 * API function. Prepare a user's translation for long-term storage and store the user's translation in long-term
 * storage.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<String>} - success message
 */
const submitTranslation = async ( req, res ) => {
  logger.info( 'attempting to submit translation' );
  let submitted = false;
  try {
    logger.info( `sending ${req.body.locale}/${req.body.simName} translation to be prepared for long-term storage` );
    const preparedTranslation = await prepareTranslationForLongTermStorage( req.body );
    logger.info( `sending ${req.body.locale}/${req.body.simName} translation to be stored long-term` );
    const longTermStorageRes = await storeTranslationLongTerm( preparedTranslation );
    if ( longTermStorageRes ) {
      logger.info( 'successfully stored translation long term' );
      reportObjectCache.setDirtyObject( req.body.locale, req.body.simName );
      const wasDeleted = deleteSavedTranslation( {
        userId: req.body.userId,
        simName: req.body.simName,
        locale: req.body.locale
      } );
      if ( wasDeleted ) {
        logger.info( 'previously saved translation deleted' );
      }
      else {
        logger.warn( 'either deletion of previously saved translation failed or there was no previously saved translation' );
      }
      const buildRequestRes = await requestBuild( req.body.simName, req.body.locale, req.body.userId );
      if ( buildRequestRes ) {
        logger.info( 'build request succeeded' );
      }
      submitted = buildRequestRes;
    }
    else {
      logger.error( `long-term storage of ${req.body.locale}/${req.body.simName} failed` );
    }
  }
  catch( e ) {
    logger.error( e );
  }
  logger.info( `translation was submitted: ${submitted}` );
  logger.info( 'done attempting to submit translation' );
  res.send( submitted );
};

export default submitTranslation;