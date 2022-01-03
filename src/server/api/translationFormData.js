// Copyright 2021, University of Colorado Boulder

/**
 * Provide functionality for the translation form data API route.
 *
 * @author Liam Mulhall
 */

import getTranslationFormData from '../getTranslationFormData.js';
import logger from '../logger.js';

/**
 * API function. Send translation form data.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<String>} - translation form data
 */
const translationFormData = async ( req, res ) => {
  try {
    const translationFormData = await getTranslationFormData( req.params.simName, req.params.locale );
    logger.info( `responding with ${req.params.locale}/${req.params.simName}'s translation form data` );
    res.header( 'Content-Type', 'application/json' );
    res.send( JSON.stringify( translationFormData, null, 2 ) );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default translationFormData;