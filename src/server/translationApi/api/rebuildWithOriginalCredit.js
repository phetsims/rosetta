// Copyright 2022, University of Colorado Boulder

import logger from '../logger.js';

/**
 * API function. Respond with the current SHA of the running instance of Rosetta.
 *
 * @param {Object} req - the Express request object
 * @param {Object} res - the Express response object
 */
const rebuildWithOriginalCredit = ( req, res ) => {
  logger.info( 'trigger build' );
  const buildObject = {
    sim: req.params.simName,
    locale: req.params.locale,
    userId: req.params.userId
  };
  logger.info( 'build object:' );
  logger.info( JSON.stringify( buildObject, null, 2 ) );
  res.end();
};

export default rebuildWithOriginalCredit;