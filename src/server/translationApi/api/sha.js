// Copyright 2022, University of Colorado Boulder

/**
 * Send the SHA of the running instance of Rosetta.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from '../logger.js';
import getCurrentRosettaSha from '../getCurrentRosettaSha.js';

/**
 * API function. Respond with the current SHA of the running instance of Rosetta.
 *
 * @param {Object} req - the Express request object
 * @param {Object} res - the Express response object
 */
const sha = ( req, res ) => {
  logger.info( 'responding with sha' );
  const sha = getCurrentRosettaSha();
  res.json( { sha: sha } );
};

export default sha;