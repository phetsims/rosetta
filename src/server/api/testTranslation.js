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
const testTranslation = ( req, res ) => {
  try {
    const response = {
      simName: req.params.simName
    };
    for ( const queryParam of Object.keys( req.query ) ) {
      response[ queryParam ] = req.query[ queryParam ];
    }
    logger.warn( JSON.stringify( req.query, null, 2 ) );
    res.json( response );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default testTranslation;