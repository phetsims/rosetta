// Copyright 2022, University of Colorado Boulder

import logger from '../logger.js';
import requestRebuildWithOriginalCredit from '../rebuildWithOriginalCredit/requestRebuildWithOriginalCredit.js';

/**
 * API function. Respond with the current SHA of the running instance of Rosetta.
 *
 * @param {Object} req - the Express request object
 * @param {Object} res - the Express response object
 */
const rebuildWithOriginalCredit = async ( req, res ) => {
  logger.info( 'rebuilding with original credit' );
  try {
    const rebuildRes = await requestRebuildWithOriginalCredit(
      req.params.simName,
      req.params.locale,
      req.params.userId
    );
    if ( rebuildRes.status >= 200 && rebuildRes.status < 300 ) {
      logger.info( 'rebuilt with original credit' );
      res.end();
    }
  }
  catch( e ) {
    logger.error( 'rebuild with original credit failed' );
    logger.error( e );
    res.end();
  }
};

export default rebuildWithOriginalCredit;