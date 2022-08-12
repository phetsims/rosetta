// Copyright 2021, University of Colorado Boulder

/**
 * Provide functionality for the sim names API route.
 *
 * @author Liam Mulhall
 */

import getSimNames from '../getSimNames.js';
import logger from '../logger.js';

/**
 * API function. Send sim names that we get from sim metadata.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} - sim names
 */
const simNames = async ( req, res ) => {
  try {
    const simNames = await getSimNames();
    logger.info( 'responding with sim names' );
    res.json( simNames );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default simNames;