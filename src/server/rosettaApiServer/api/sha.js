// Copyright 2022, University of Colorado Boulder

import getCurrentSha from '../getCurrentSha.js';
import logger from '../../common/logger.js';

/**
 * API function. Send the current SHA of the running instance of Rosetta.
 *
 * @param {Object} req - the Express request object
 * @param {Object} res - the Express response object
 */
const sha = ( req, res ) => {
  try {
    const sha = getCurrentSha();
    logger.info( 'responding with sha' );
    res.send( sha );
  }
  catch( e ) {
    logger.error( e );
  }
};

export default sha;