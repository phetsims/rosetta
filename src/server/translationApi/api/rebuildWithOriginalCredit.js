// Copyright 2022, University of Colorado Boulder

/**
 * Request a rebuild for a sim with the original submitter's user ID.
 * This is what we used to call "trigger build".
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */

import logger from '../logger.js';
import requestRebuildWithOriginalCredit from '../rebuildWithOriginalCredit/requestRebuildWithOriginalCredit.js';

/**
 * API function. Request a rebuild of the sim with the correct user ID.
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
      req.params.userId,
      req.query.websiteUserData
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