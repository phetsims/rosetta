// Copyright 2021, University of Colorado Boulder

/**
 * Provide functionality for submit translation API route.
 *
 * @author Liam Mulhall
 */

import logger from '../../common/logger.js';
import prepareTranslationForLongTermStorage from '../prepareTranslationForLongTermStorage.js';
import storeTranslationLongTerm from '../storeTranslationLongTerm.js';

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
    await storeTranslationLongTerm( preparedTranslation );
    res.send( 'translation submitted' );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default submitTranslation;