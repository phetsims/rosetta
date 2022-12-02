// Copyright 2021, University of Colorado Boulder

/**
 * Provide functionality for submit translation API route.
 *
 * @author Liam Mulhall
 */

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
  try {
    logger.info( `sending ${req.body.locale}/${req.body.simName} translation to be prepared for long-term storage` );
    const preparedTranslation = await prepareTranslationForLongTermStorage( req.body );
    logger.info( `sending ${req.body.locale}/${req.body.simName} translation to be stored long-term` );
    const longTermStorageRes = await storeTranslationLongTerm( preparedTranslation );
    if ( longTermStorageRes ) {
      reportObjectCache.setDirtyObject( req.body.locale, req.body.simName );
      const buildRequestRes = await requestBuild( req.body.simName, req.body.locale, req.body.userId );
      if ( buildRequestRes ) {
        logger.info( 'build request succeeded' );
        res.send( 'translation submitted' );
      }
    }
    else {
      logger.error( `long term storage of ${req.body.locale}/${req.body.simName} failed` );
    }
  }
  catch( e ) {
    logger.error( e );
  }
};

export default submitTranslation;