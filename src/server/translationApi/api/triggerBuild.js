// Copyright 2022, University of Colorado Boulder

/**
 * Request a rebuild for a sim with the original submitter's user ID.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from '../logger.js';
import requestTriggerBuild from '../triggerBuild/requestTriggerBuild.js';

/**
 * API function. Request a rebuild of the sim with the correct user ID.
 *
 * @param {Object} req - the Express request object
 * @param {Object} res - the Express response object
 */
const triggerBuild = async ( req, res ) => {
  logger.info( 'rebuilding with original credit' );
  try {
    const rebuildRes = await requestTriggerBuild(
      req.params.simName,
      req.params.locale,
      req.params.userId
    );
    if ( rebuildRes ) {
      logger.info( 'rebuilt with original credit' );
      res.send( 'success' );
    }
    else {
      res.send( 'failure' );
    }
  }
  catch( e ) {
    logger.error( 'rebuild with original credit failed' );
    logger.error( e );
    res.end();
  }
};

export default triggerBuild;