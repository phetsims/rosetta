// Copyright 2023, University of Colorado Boulder

/**
 * @author Liam Mulhall
 */

import { Request, Response } from 'express';
import logger from '../logger.js';
import { reportObjectCache } from '../translationApi.js';

// This is for express
const flushReportObject = ( req: Request, res: Response ): void => {
  logger.info( `attempting to flush report object for ${req.params.locale} ${req.params.sim}` );
  const flushed = reportObjectCache.flushObject( req.params.locale, req.params.sim );
  if ( flushed ) {
    logger.info( `flushed report object for ${req.params.locale} ${req.params.sim}` );
    res.send( 'success' );
  }
  else {
    logger.info( `no report object for ${req.params.locale} ${req.params.sim} found, no flush performed` );
    res.send( 'failure' );
  }
};

export default flushReportObject;