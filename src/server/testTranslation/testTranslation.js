// Copyright 2022, University of Colorado Boulder

/**
 * Provide functionality for the test translation route.
 *
 * @author Liam Mulhall
 */

import logger from '../logger.js';

/**
 * todo: update this when done
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {} - todo: add type when done
 */
const testTranslation = async ( req, res ) => {
  try {
    res.send( '<h1>Hi</h1>' );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default testTranslation;